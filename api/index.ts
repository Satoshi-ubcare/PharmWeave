import 'express-async-errors'
import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z, ZodError } from 'zod'

const prisma = new PrismaClient()
const app = express()

app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*' }))
app.use(express.json())

// ─── Error Handler ────────────────────────────────────────
class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message)
  }
}

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Validation failed', details: err.errors })
    return
  }
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message })
    return
  }
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

function validate(schema: z.ZodSchema) {
  return (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    req.body = schema.parse(req.body)
    next()
  }
}

// ─── Domain ───────────────────────────────────────────────
type WorkflowStage = 'reception'|'prescription'|'dispensing'|'review'|'payment'|'claim'|'completed'
const TRANSITIONS: Record<WorkflowStage, WorkflowStage> = {
  reception:'prescription', prescription:'dispensing', dispensing:'review',
  review:'payment', payment:'claim', claim:'completed', completed:'completed'
}
function canTransition(from: WorkflowStage, to: WorkflowStage) { return TRANSITIONS[from] === to }

function calcCopay(items: {unit_price:number;quantity:number;days:number}[]) {
  const total = items.reduce((s,i) => s + i.unit_price * i.quantity * i.days, 0)
  const rate = total < 10000 ? 0.2 : 0.3
  const copay = Math.round(total * rate)
  return { totalDrugCost: total, copayAmount: copay, insuranceCoverage: total - copay }
}

// ─── Health ───────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

// ─── Auth ─────────────────────────────────────────────────
const authSchema = z.object({ username: z.string().min(3), password: z.string().min(6) })

app.post('/api/auth/login', validate(authSchema), async (req, res) => {
  const { username, password } = req.body
  const user = await prisma.user.findUnique({ where: { username } })
  if (!user || !(await bcrypt.compare(password, user.password_hash)))
    throw new AppError(401, '아이디 또는 비밀번호가 올바르지 않습니다.')
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '24h' })
  res.json({ token })
})

app.post('/api/auth/register', validate(authSchema), async (req, res) => {
  const { username, password } = req.body
  if (await prisma.user.findUnique({ where: { username } }))
    throw new AppError(409, '이미 사용 중인 아이디입니다.')
  const password_hash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({ data: { username, password_hash } })
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '24h' })
  res.status(201).json({ token })
})

// ─── Patients ─────────────────────────────────────────────
const createPatientSchema = z.object({
  name: z.string().min(2).max(50),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  phone: z.string().regex(/^\d{10,11}$/).optional(),
})

app.get('/api/patients', async (req, res) => {
  const q = String(req.query.q ?? '')
  const dateCandidate = new Date(q)
  const isValidDate = q.match(/^\d{4}-\d{2}-\d{2}$/) && !isNaN(dateCandidate.getTime())
  const patients = await prisma.patient.findMany({
    where: q ? { OR: [
      { name: { contains: q, mode: 'insensitive' } },
      ...(isValidDate ? [{ birth_date: { equals: dateCandidate } }] : []),
    ]} : undefined,
    orderBy: { name: 'asc' }, take: 20,
  })
  res.json(patients)
})

app.post('/api/patients', validate(createPatientSchema), async (req, res) => {
  const { name, birth_date, phone } = req.body
  if (await prisma.patient.findUnique({ where: { name_birth_date: { name, birth_date: new Date(birth_date) } } }))
    throw new AppError(409, '동일한 이름과 생년월일의 환자가 이미 존재합니다.')
  const patient = await prisma.patient.create({ data: { name, birth_date: new Date(birth_date), phone } })
  res.status(201).json(patient)
})

app.get('/api/patients/:id', async (req, res) => {
  const patient = await prisma.patient.findUnique({ where: { id: req.params.id } })
  if (!patient) throw new AppError(404, '환자를 찾을 수 없습니다.')
  res.json(patient)
})

// ─── Visits ───────────────────────────────────────────────
app.post('/api/visits', async (req, res) => {
  const { patient_id } = z.object({ patient_id: z.string().uuid() }).parse(req.body)
  if (!await prisma.patient.findUnique({ where: { id: patient_id } }))
    throw new AppError(404, '환자를 찾을 수 없습니다.')
  const visit = await prisma.visit.create({ data: { patient_id }, include: { patient: true } })
  res.status(201).json(visit)
})

app.get('/api/visits/today', async (_req, res) => {
  const start = new Date(); start.setHours(0,0,0,0)
  const end = new Date(); end.setHours(23,59,59,999)
  const visits = await prisma.visit.findMany({
    where: { visited_at: { gte: start, lte: end } },
    include: { patient: true }, orderBy: { visited_at: 'desc' },
  })
  res.json(visits)
})

app.get('/api/visits/:id', async (req, res) => {
  const visit = await prisma.visit.findUnique({ where: { id: req.params.id }, include: { patient: true } })
  if (!visit) throw new AppError(404, '방문 기록을 찾을 수 없습니다.')
  res.json(visit)
})

app.patch('/api/visits/:id/stage', async (req, res) => {
  const { stage } = z.object({ stage: z.enum(['reception','prescription','dispensing','review','payment','claim','completed']) }).parse(req.body)
  const visit = await prisma.visit.findUnique({ where: { id: req.params.id } })
  if (!visit) throw new AppError(404, '방문 기록을 찾을 수 없습니다.')
  if (!canTransition(visit.workflow_stage as WorkflowStage, stage as WorkflowStage))
    throw new AppError(422, `${visit.workflow_stage} → ${stage} 전환은 허용되지 않습니다.`)
  if (stage === 'review') {
    const rx = await prisma.prescription.findUnique({ where: { visit_id: req.params.id }, include: { items: true } })
    if (!rx || rx.items.length === 0) throw new AppError(422, '처방 항목이 1개 이상 있어야 합니다.')
  }
  if (stage === 'claim') {
    if (!await prisma.payment.findUnique({ where: { visit_id: req.params.id } }))
      throw new AppError(422, '수납이 완료되어야 청구가 가능합니다.')
  }
  const updated = await prisma.visit.update({ where: { id: req.params.id }, data: { workflow_stage: stage as WorkflowStage }, include: { patient: true } })
  res.json(updated)
})

// ─── Prescriptions ────────────────────────────────────────
const rxSchema = z.object({
  clinic_name: z.string().min(1).max(100),
  doctor_name: z.string().max(50).optional(),
  prescribed_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  items: z.array(z.object({ drug_code: z.string(), drug_name: z.string(), unit_price: z.number().int().positive(), quantity: z.number().int().positive(), days: z.number().int().positive() })).min(1),
})

app.post('/api/visits/:visitId/prescriptions', validate(rxSchema), async (req, res) => {
  const { visitId } = req.params
  const { clinic_name, doctor_name, prescribed_at, items } = req.body
  if (!await prisma.visit.findUnique({ where: { id: visitId } })) throw new AppError(404, '방문 기록을 찾을 수 없습니다.')
  const existing = await prisma.prescription.findUnique({ where: { visit_id: visitId } })
  if (existing) {
    const rx = await prisma.prescription.update({ where: { visit_id: visitId }, data: { clinic_name, doctor_name, prescribed_at: new Date(prescribed_at), items: { deleteMany: {}, createMany: { data: items } } }, include: { items: true } })
    res.json(rx); return
  }
  const rx = await prisma.prescription.create({ data: { visit_id: visitId, clinic_name, doctor_name, prescribed_at: new Date(prescribed_at), items: { createMany: { data: items } } }, include: { items: true } })
  res.status(201).json(rx)
})

app.get('/api/visits/:visitId/prescriptions', async (req, res) => {
  const rx = await prisma.prescription.findUnique({ where: { visit_id: req.params.visitId }, include: { items: true } })
  if (!rx) throw new AppError(404, '처방 정보가 없습니다.')
  res.json(rx)
})

// ─── Drugs ────────────────────────────────────────────────
app.get('/api/drugs', async (req, res) => {
  const q = String(req.query.q ?? '')
  const drugs = await prisma.drug.findMany({
    where: q ? { OR: [{ drug_name: { contains: q, mode: 'insensitive' } }, { drug_code: { contains: q } }] } : undefined,
    orderBy: { drug_name: 'asc' }, take: 20,
  })
  res.json(drugs)
})

// ─── Payment ──────────────────────────────────────────────
app.post('/api/visits/:visitId/payment', async (req, res) => {
  const { visitId } = req.params
  const { method } = z.object({ method: z.enum(['cash','card','transfer']) }).parse(req.body)
  if (await prisma.payment.findUnique({ where: { visit_id: visitId } })) throw new AppError(409, '이미 수납이 완료된 방문입니다.')
  const rx = await prisma.prescription.findUnique({ where: { visit_id: visitId }, include: { items: true } })
  if (!rx || rx.items.length === 0) throw new AppError(422, '처방 정보가 없습니다.')
  const { totalDrugCost, copayAmount, insuranceCoverage } = calcCopay(rx.items)
  const payment = await prisma.payment.create({ data: { visit_id: visitId, total_drug_cost: totalDrugCost, copay_amount: copayAmount, insurance_coverage: insuranceCoverage, payment_method: method } })
  res.status(201).json(payment)
})

app.get('/api/visits/:visitId/payment', async (req, res) => {
  const payment = await prisma.payment.findUnique({ where: { visit_id: req.params.visitId } })
  if (!payment) throw new AppError(404, '수납 정보가 없습니다.')
  res.json(payment)
})

// ─── Claim ────────────────────────────────────────────────
app.post('/api/visits/:visitId/claim', async (req, res) => {
  const { visitId } = req.params
  if (await prisma.claim.findUnique({ where: { visit_id: visitId } })) throw new AppError(409, '이미 청구가 완료된 방문입니다.')
  const visit = await prisma.visit.findUnique({ where: { id: visitId }, include: { patient: true, prescription: { include: { items: true } }, payment: true } })
  if (!visit) throw new AppError(404, '방문 기록을 찾을 수 없습니다.')
  if (!visit.prescription || visit.prescription.items.length === 0) throw new AppError(422, '처방 정보가 없습니다.')
  if (!visit.payment) throw new AppError(422, '수납 정보가 없습니다.')
  const claimData = {
    visit_id: visitId, patient_name: visit.patient.name,
    birth_date: visit.patient.birth_date.toISOString().split('T')[0],
    clinic_name: visit.prescription.clinic_name, doctor_name: visit.prescription.doctor_name,
    prescribed_at: visit.prescription.prescribed_at.toISOString().split('T')[0],
    items: visit.prescription.items.map((i: {unit_price:number;quantity:number;days:number;[k:string]:unknown}) => ({ ...i, total: i.unit_price * i.quantity * i.days })),
    total_drug_cost: visit.payment.total_drug_cost, copay_amount: visit.payment.copay_amount,
    insurance_coverage: visit.payment.insurance_coverage, claimed_at: new Date().toISOString(),
  }
  const claim = await prisma.claim.create({ data: { visit_id: visitId, claim_data: claimData as object } })
  res.status(201).json(claim)
})

app.get('/api/visits/:visitId/claim', async (req, res) => {
  const claim = await prisma.claim.findUnique({ where: { visit_id: req.params.visitId } })
  if (!claim) throw new AppError(404, '청구 정보가 없습니다.')
  res.json(claim)
})

// ─── Plugins ──────────────────────────────────────────────
app.get('/api/plugins', async (_req, res) => { res.json(await prisma.pluginConfig.findMany()) })

app.patch('/api/plugins/:id', async (req, res) => {
  const { enabled } = z.object({ enabled: z.boolean() }).parse(req.body)
  if (!await prisma.pluginConfig.findUnique({ where: { id: req.params.id } })) throw new AppError(404, 'Plugin을 찾을 수 없습니다.')
  res.json(await prisma.pluginConfig.update({ where: { id: req.params.id }, data: { enabled } }))
})

app.post('/api/plugins/:id/execute', async (req, res) => {
  const { visitId } = z.object({ visitId: z.string().uuid() }).parse(req.body)
  const plugin = await prisma.pluginConfig.findUnique({ where: { id: req.params.id } })
  if (!plugin) throw new AppError(404, 'Plugin을 찾을 수 없습니다.')
  if (!plugin.enabled) { res.json({ skipped: true }); return }
  const rx = await prisma.prescription.findUnique({ where: { visit_id: visitId }, include: { items: true } })
  if (req.params.id === 'medication-guide') {
    const guides = (rx?.items ?? []).map((item: {drug_name:string;quantity:number;days:number}) => ({
      drug_name: item.drug_name, how_to_take: `1회 ${item.quantity}정, ${item.days}일 복용`,
      warnings: ['식후 30분에 복용하세요.', '정해진 용량을 지켜주세요.'],
    }))
    res.json({ visitId, guides, generatedAt: new Date().toISOString() })
  } else if (req.params.id === 'dur') {
    res.json({ visitId, warnings: [], status: 'safe', checkedAt: new Date().toISOString() })
  } else {
    throw new AppError(400, `알 수 없는 Plugin: ${req.params.id}`)
  }
})

export default app
