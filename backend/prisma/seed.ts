import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ─── 관리자 계정 ──────────────────────────────────────────
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password_hash: await bcrypt.hash('admin1234', 10),
    },
  })

  // ─── 약품 마스터 (20개) ───────────────────────────────────
  const drugs = [
    { drug_code: '644900060', drug_name: '아모잖실린캡슐250mg', unit_price: 120 },
    { drug_code: '644900061', drug_name: '아목시실린캡슐500mg', unit_price: 180 },
    { drug_code: '497000540', drug_name: '타이레놀정500mg', unit_price: 85 },
    { drug_code: '497000541', drug_name: '이부프로펜정200mg', unit_price: 95 },
    { drug_code: '200300670', drug_name: '덱사메타손정0.5mg', unit_price: 65 },
    { drug_code: '200300671', drug_name: '프레드니솔론정5mg', unit_price: 110 },
    { drug_code: '170300040', drug_name: '메트포르민정500mg', unit_price: 75 },
    { drug_code: '170300041', drug_name: '글리피자이드정5mg', unit_price: 140 },
    { drug_code: '218500020', drug_name: '에나라프릴정5mg', unit_price: 130 },
    { drug_code: '218500021', drug_name: '로사르탄칼륨정50mg', unit_price: 160 },
    { drug_code: '228500010', drug_name: '아토바스타틴정10mg', unit_price: 220 },
    { drug_code: '228500011', drug_name: '로수바스타틴정5mg', unit_price: 195 },
    { drug_code: '232000010', drug_name: '오메프라졸캡슐20mg', unit_price: 175 },
    { drug_code: '232000011', drug_name: '판토프라졸정40mg', unit_price: 185 },
    { drug_code: '260200070', drug_name: '세티리진정10mg', unit_price: 145 },
    { drug_code: '260200071', drug_name: '로라타딘정10mg', unit_price: 135 },
    { drug_code: '629900010', drug_name: '아지스로마이신정250mg', unit_price: 580 },
    { drug_code: '629900011', drug_name: '클래리스로마이신정500mg', unit_price: 420 },
    { drug_code: '119000030', drug_name: '에스오메프라졸정20mg', unit_price: 210 },
    { drug_code: '119000031', drug_name: '란소프라졸캡슐15mg', unit_price: 190 },
  ]

  for (const drug of drugs) {
    await prisma.drug.upsert({
      where: { drug_code: drug.drug_code },
      update: {},
      create: drug,
    })
  }

  // ─── 환자 5명 ─────────────────────────────────────────────
  const patients = await Promise.all([
    prisma.patient.upsert({
      where: { name_birth_date: { name: '김민준', birth_date: new Date('1975-03-15') } },
      update: {},
      create: { name: '김민준', birth_date: new Date('1975-03-15'), phone: '01012345678' },
    }),
    prisma.patient.upsert({
      where: { name_birth_date: { name: '이서연', birth_date: new Date('1988-07-22') } },
      update: {},
      create: { name: '이서연', birth_date: new Date('1988-07-22'), phone: '01098765432' },
    }),
    prisma.patient.upsert({
      where: { name_birth_date: { name: '박지호', birth_date: new Date('1965-11-08') } },
      update: {},
      create: { name: '박지호', birth_date: new Date('1965-11-08'), phone: '01055556666' },
    }),
    prisma.patient.upsert({
      where: { name_birth_date: { name: '최유나', birth_date: new Date('1992-05-30') } },
      update: {},
      create: { name: '최유나', birth_date: new Date('1992-05-30'), phone: null },
    }),
    prisma.patient.upsert({
      where: { name_birth_date: { name: '정도현', birth_date: new Date('1950-09-01') } },
      update: {},
      create: { name: '정도현', birth_date: new Date('1950-09-01'), phone: '01077778888' },
    }),
  ])

  // ─── Plugin 설정 ──────────────────────────────────────────
  const pluginConfigs = [
    {
      id: 'dur',
      name: 'DUR 약물 검사',
      description: '처방 항목에 대한 약물 상호작용 및 금기 여부를 검사합니다.',
      enabled: true,
    },
    {
      id: 'medication-guide',
      name: '복약지도 생성',
      description: '처방된 약품의 복용 방법과 주의사항을 자동 생성합니다.',
      enabled: true,
    },
  ]

  for (const config of pluginConfigs) {
    await prisma.pluginConfig.upsert({
      where: { id: config.id },
      update: {},
      create: config,
    })
  }

  console.log(`✅ Seeded: ${drugs.length} drugs, ${patients.length} patients, ${pluginConfigs.length} plugins`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
