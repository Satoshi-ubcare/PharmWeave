import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  Clearing existing data...')
  await prisma.claim.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.prescriptionItem.deleteMany()
  await prisma.prescription.deleteMany()
  await prisma.visit.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.clinic.deleteMany()
  await prisma.drug.deleteMany()
  await prisma.pluginConfig.deleteMany()
  await prisma.user.deleteMany()

  console.log('🌱 Seeding database...')

  // ─── 사용자 계정 ──────────────────────────────────────────
  await prisma.user.createMany({
    data: [
      { username: 'admin', password_hash: await bcrypt.hash('admin1234', 10) },
      { username: 'pharmacist1', password_hash: await bcrypt.hash('pass1234', 10) },
    ],
  })

  // ─── 약품 마스터 (50개) ───────────────────────────────────
  const drugs = await prisma.drug.createMany({
    data: [
      // 항생제
      { drug_code: '644900060', drug_name: '아목시실린캡슐250mg', unit_price: 120 },
      { drug_code: '644900061', drug_name: '아목시실린캡슐500mg', unit_price: 180 },
      { drug_code: '629900010', drug_name: '아지스로마이신정250mg', unit_price: 580 },
      { drug_code: '629900011', drug_name: '클래리스로마이신정500mg', unit_price: 420 },
      { drug_code: '629900012', drug_name: '세파클러캡슐250mg', unit_price: 310 },
      { drug_code: '629900013', drug_name: '독시사이클린정100mg', unit_price: 240 },
      { drug_code: '629900014', drug_name: '레보플록사신정500mg', unit_price: 380 },
      // 해열·진통·소염
      { drug_code: '497000540', drug_name: '타이레놀정500mg', unit_price: 85 },
      { drug_code: '497000541', drug_name: '이부프로펜정200mg', unit_price: 95 },
      { drug_code: '497000542', drug_name: '나프록센정250mg', unit_price: 115 },
      { drug_code: '200300670', drug_name: '덱사메타손정0.5mg', unit_price: 65 },
      { drug_code: '200300671', drug_name: '프레드니솔론정5mg', unit_price: 110 },
      { drug_code: '200300672', drug_name: '멜록시캄정7.5mg', unit_price: 155 },
      // 당뇨
      { drug_code: '170300040', drug_name: '메트포르민정500mg', unit_price: 75 },
      { drug_code: '170300041', drug_name: '글리피자이드정5mg', unit_price: 140 },
      { drug_code: '170300042', drug_name: '시타글립틴정100mg', unit_price: 850 },
      { drug_code: '170300043', drug_name: '다파글리플로진정10mg', unit_price: 1200 },
      { drug_code: '170300044', drug_name: '엠파글리플로진정10mg', unit_price: 1350 },
      // 고혈압
      { drug_code: '218500020', drug_name: '에날라프릴정5mg', unit_price: 130 },
      { drug_code: '218500021', drug_name: '로사르탄칼륨정50mg', unit_price: 160 },
      { drug_code: '218500022', drug_name: '암로디핀정5mg', unit_price: 145 },
      { drug_code: '218500023', drug_name: '발사르탄정80mg', unit_price: 175 },
      { drug_code: '218500024', drug_name: '칸데사르탄정8mg', unit_price: 195 },
      { drug_code: '218500025', drug_name: '올메사르탄정20mg', unit_price: 210 },
      // 고지혈증
      { drug_code: '228500010', drug_name: '아토르바스타틴정10mg', unit_price: 220 },
      { drug_code: '228500011', drug_name: '로수바스타틴정5mg', unit_price: 195 },
      { drug_code: '228500012', drug_name: '피타바스타틴정2mg', unit_price: 260 },
      { drug_code: '228500013', drug_name: '심바스타틴정20mg', unit_price: 170 },
      // 소화기
      { drug_code: '232000010', drug_name: '오메프라졸캡슐20mg', unit_price: 175 },
      { drug_code: '232000011', drug_name: '판토프라졸정40mg', unit_price: 185 },
      { drug_code: '119000030', drug_name: '에스오메프라졸정20mg', unit_price: 210 },
      { drug_code: '119000031', drug_name: '란소프라졸캡슐15mg', unit_price: 190 },
      { drug_code: '119000032', drug_name: '라베프라졸정10mg', unit_price: 205 },
      // 알레르기·호흡기
      { drug_code: '260200070', drug_name: '세티리진정10mg', unit_price: 145 },
      { drug_code: '260200071', drug_name: '로라타딘정10mg', unit_price: 135 },
      { drug_code: '260200072', drug_name: '펙소페나딘정120mg', unit_price: 280 },
      { drug_code: '260200073', drug_name: '몬테루카스트정10mg', unit_price: 320 },
      { drug_code: '260200074', drug_name: '부데소니드흡입제', unit_price: 4800 },
      // 신경계·정신건강
      { drug_code: '113000010', drug_name: '에스시탈로프람정10mg', unit_price: 380 },
      { drug_code: '113000011', drug_name: '세르트랄린정50mg', unit_price: 290 },
      { drug_code: '113000012', drug_name: '알프라졸람정0.25mg', unit_price: 85 },
      { drug_code: '113000013', drug_name: '졸피뎀정10mg', unit_price: 120 },
      // 갑상선
      { drug_code: '244000010', drug_name: '레보티록신정50mcg', unit_price: 95 },
      { drug_code: '244000011', drug_name: '레보티록신정100mcg', unit_price: 110 },
      // 골다공증
      { drug_code: '391000010', drug_name: '알렌드론산정70mg', unit_price: 420 },
      { drug_code: '391000011', drug_name: '리세드론산정35mg', unit_price: 380 },
      // 비타민·영양제
      { drug_code: '100000010', drug_name: '비타민C정1000mg', unit_price: 55 },
      { drug_code: '100000011', drug_name: '비타민D3정1000IU', unit_price: 70 },
      { drug_code: '100000012', drug_name: '오메가3연질캡슐', unit_price: 180 },
      { drug_code: '100000013', drug_name: '엽산정400mcg', unit_price: 65 },
    ],
  })

  // ─── 의료기관 (10개) ───────────────────────────────────────
  const clinicNames = [
    '서울내과의원', '연세내과의원', '강남이비인후과', '미소피부과',
    '한빛정형외과', '광화문내과의원', '드림소아과', '신촌내과',
    '하나안과', '노인전문의원',
  ]
  await prisma.clinic.createMany({
    data: clinicNames.map((name) => ({ name })),
  })

  // ─── 환자 150명 ───────────────────────────────────────────
  const surnames = ['김', '이', '박', '최', '정', '한', '오', '윤', '장', '임', '강', '신', '류', '홍', '조', '권', '서', '송', '전', '안']
  const maleNames = ['민준', '준서', '도현', '태양', '재원', '지호', '현우', '성민', '영수', '용준', '민혁', '준혁', '진우', '동현', '성호', '재민', '승현', '정우', '민성', '지훈', '태민', '우진', '현준', '시우', '지환']
  const femaleNames = ['서연', '유나', '수진', '지민', '소희', '민서', '하은', '영희', '지수', '미래', '수현', '예린', '지영', '민지', '하늘', '소이', '예원', '수아', '나연', '유진', '채원', '지아', '예지', '보람', '소담']

  const birthYears = [
    1945, 1948, 1950, 1952, 1955, 1957, 1960, 1962, 1965, 1967,
    1970, 1972, 1975, 1977, 1980, 1982, 1985, 1987, 1990, 1992,
    1995, 1997, 2000, 2002, 2005,
  ]
  const phones = (i: number) => i % 7 === 0 ? null : `010${String(10000000 + i * 1234567 % 90000000).padStart(8, '0')}`

  const patientData: { name: string; birth_date: Date; phone: string | null; gender: string }[] = []
  let idx = 0
  for (let si = 0; si < surnames.length; si++) {
    // 남성 (7-8명 per surname)
    for (let ni = 0; ni < 4; ni++) {
      const year = birthYears[(si * 4 + ni) % birthYears.length]
      const month = (si + ni + 1) % 12 + 1
      const day = (ni * 7 + 5) % 28 + 1
      patientData.push({
        name: surnames[si] + maleNames[(si * 4 + ni) % maleNames.length],
        birth_date: new Date(`${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`),
        phone: phones(idx),
        gender: 'M',
      })
      idx++
    }
    // 여성 (3-4명 per surname)
    for (let ni = 0; ni < 3; ni++) {
      const year = birthYears[(si * 3 + ni + 5) % birthYears.length]
      const month = (si + ni + 3) % 12 + 1
      const day = (ni * 11 + 3) % 28 + 1
      patientData.push({
        name: surnames[si] + femaleNames[(si * 3 + ni) % femaleNames.length],
        birth_date: new Date(`${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`),
        phone: phones(idx),
        gender: 'F',
      })
      idx++
    }
  }

  const patientList = await Promise.all(
    patientData.map((d) => prisma.patient.create({ data: d }))
  )

  // ─── 오늘 방문 150건 ──────────────────────────────────────
  const today = new Date()
  const t = (h: number, m: number) => {
    const d = new Date(today)
    d.setHours(h, m, 0, 0)
    return d
  }

  const prescriptionTemplates = [
    // 당뇨+고혈압 복합
    { clinic: '서울내과의원', doctor: '이민호', items: [
      { drug_code: '170300040', drug_name: '메트포르민정500mg', unit_price: 75, quantity: 2, days: 30 },
      { drug_code: '218500021', drug_name: '로사르탄칼륨정50mg', unit_price: 160, quantity: 1, days: 30 },
      { drug_code: '228500010', drug_name: '아토르바스타틴정10mg', unit_price: 220, quantity: 1, days: 30 },
    ]},
    // 이비인후과 (단기)
    { clinic: '강남이비인후과', doctor: '박성호', items: [
      { drug_code: '644900060', drug_name: '아목시실린캡슐250mg', unit_price: 120, quantity: 2, days: 5 },
      { drug_code: '260200070', drug_name: '세티리진정10mg', unit_price: 145, quantity: 1, days: 5 },
      { drug_code: '497000540', drug_name: '타이레놀정500mg', unit_price: 85, quantity: 3, days: 5 },
    ]},
    // 만성질환 (장기)
    { clinic: '연세내과의원', doctor: '김지수', items: [
      { drug_code: '170300040', drug_name: '메트포르민정500mg', unit_price: 75, quantity: 2, days: 90 },
      { drug_code: '170300041', drug_name: '글리피자이드정5mg', unit_price: 140, quantity: 1, days: 90 },
      { drug_code: '218500020', drug_name: '에날라프릴정5mg', unit_price: 130, quantity: 1, days: 90 },
    ]},
    // 피부과
    { clinic: '미소피부과', doctor: '최준영', items: [
      { drug_code: '200300671', drug_name: '프레드니솔론정5mg', unit_price: 110, quantity: 1, days: 7 },
      { drug_code: '260200072', drug_name: '펙소페나딘정120mg', unit_price: 280, quantity: 1, days: 7 },
    ]},
    // 정형외과
    { clinic: '한빛정형외과', doctor: '이상훈', items: [
      { drug_code: '497000541', drug_name: '이부프로펜정200mg', unit_price: 95, quantity: 3, days: 7 },
      { drug_code: '497000542', drug_name: '나프록센정250mg', unit_price: 115, quantity: 2, days: 7 },
    ]},
    // 고혈압+고지혈+소화기 복합
    { clinic: '광화문내과의원', doctor: '정혜진', items: [
      { drug_code: '218500022', drug_name: '암로디핀정5mg', unit_price: 145, quantity: 1, days: 60 },
      { drug_code: '228500011', drug_name: '로수바스타틴정5mg', unit_price: 195, quantity: 1, days: 60 },
      { drug_code: '232000010', drug_name: '오메프라졸캡슐20mg', unit_price: 175, quantity: 1, days: 60 },
    ]},
    // 소아과
    { clinic: '드림소아과', doctor: '박재현', items: [
      { drug_code: '644900060', drug_name: '아목시실린캡슐250mg', unit_price: 120, quantity: 2, days: 7 },
      { drug_code: '260200071', drug_name: '로라타딘정10mg', unit_price: 135, quantity: 1, days: 7 },
      { drug_code: '100000010', drug_name: '비타민C정1000mg', unit_price: 55, quantity: 1, days: 7 },
    ]},
    // 안과
    { clinic: '하나안과', doctor: '유진철', items: [
      { drug_code: '200300670', drug_name: '덱사메타손정0.5mg', unit_price: 65, quantity: 4, days: 5 },
    ]},
    // 노인 복합처방
    { clinic: '노인전문의원', doctor: '이철수', items: [
      { drug_code: '218500023', drug_name: '발사르탄정80mg', unit_price: 175, quantity: 1, days: 30 },
      { drug_code: '228500012', drug_name: '피타바스타틴정2mg', unit_price: 260, quantity: 1, days: 30 },
      { drug_code: '232000011', drug_name: '판토프라졸정40mg', unit_price: 185, quantity: 1, days: 30 },
      { drug_code: '100000011', drug_name: '비타민D3정1000IU', unit_price: 70, quantity: 1, days: 30 },
    ]},
    // 호흡기
    { clinic: '신촌내과', doctor: '강태호', items: [
      { drug_code: '629900010', drug_name: '아지스로마이신정250mg', unit_price: 580, quantity: 1, days: 3 },
      { drug_code: '497000540', drug_name: '타이레놀정500mg', unit_price: 85, quantity: 3, days: 3 },
      { drug_code: '260200073', drug_name: '몬테루카스트정10mg', unit_price: 320, quantity: 1, days: 5 },
    ]},
  ]

  const calcTotal = (items: { unit_price: number; quantity: number; days: number }[]) =>
    items.reduce((s, i) => s + i.unit_price * i.quantity * i.days, 0)

  // 방문 순서를 위한 시간 카운터
  let visitTime = { h: 8, m: 0 }
  const nextTime = () => {
    const result = t(visitTime.h, visitTime.m)
    visitTime.m += 5
    if (visitTime.m >= 60) { visitTime.m = 0; visitTime.h++ }
    return result
  }

  let pIdx = 0
  const nextPatient = () => patientList[pIdx++ % patientList.length]

  // ─── 완료(completed) 80건 ────────────────────────────────
  for (let i = 0; i < 80; i++) {
    const tmpl = prescriptionTemplates[i % prescriptionTemplates.length]
    const patient = nextPatient()
    const visitedAt = nextTime()
    const visit = await prisma.visit.create({
      data: { patient_id: patient.id, workflow_stage: 'completed', visited_at: visitedAt },
    })
    const total = calcTotal(tmpl.items)
    const copay = Math.round(total * (total < 10000 ? 0.2 : 0.3))
    const rx = await prisma.prescription.create({
      data: {
        visit_id: visit.id,
        clinic_name: tmpl.clinic,
        doctor_name: tmpl.doctor,
        prescribed_at: new Date(today.toDateString()),
        items: { create: tmpl.items },
      },
    })
    const payment = await prisma.payment.create({
      data: {
        visit_id: visit.id,
        total_drug_cost: total,
        copay_amount: copay,
        insurance_coverage: total - copay,
        payment_method: ['card', 'cash', 'transfer'][i % 3],
      },
    })
    await prisma.claim.create({
      data: {
        visit_id: visit.id,
        claim_status: i % 3 === 0 ? 'approved' : 'submitted',
        claim_data: {
          visit_id: visit.id,
          patient_name: patient.name,
          clinic_name: tmpl.clinic,
          doctor_name: tmpl.doctor,
          prescribed_at: today.toISOString().split('T')[0],
          items: tmpl.items.map((it) => ({ ...it, total: it.unit_price * it.quantity * it.days })),
          total_drug_cost: total,
          copay_amount: payment.copay_amount,
          insurance_coverage: payment.insurance_coverage,
          claimed_at: new Date().toISOString(),
        },
      },
    })
  }

  // ─── 청구(claim) 15건 ────────────────────────────────────
  for (let i = 0; i < 15; i++) {
    const tmpl = prescriptionTemplates[i % prescriptionTemplates.length]
    const patient = nextPatient()
    const visit = await prisma.visit.create({
      data: { patient_id: patient.id, workflow_stage: 'claim', visited_at: nextTime() },
    })
    const total = calcTotal(tmpl.items)
    const copay = Math.round(total * (total < 10000 ? 0.2 : 0.3))
    await prisma.prescription.create({
      data: {
        visit_id: visit.id,
        clinic_name: tmpl.clinic,
        doctor_name: tmpl.doctor,
        prescribed_at: new Date(today.toDateString()),
        items: { create: tmpl.items },
      },
    })
    await prisma.payment.create({
      data: {
        visit_id: visit.id,
        total_drug_cost: total,
        copay_amount: copay,
        insurance_coverage: total - copay,
        payment_method: ['card', 'cash', 'transfer'][i % 3],
      },
    })
  }

  // ─── 수납(payment) 15건 ──────────────────────────────────
  for (let i = 0; i < 15; i++) {
    const tmpl = prescriptionTemplates[i % prescriptionTemplates.length]
    const patient = nextPatient()
    const visit = await prisma.visit.create({
      data: { patient_id: patient.id, workflow_stage: 'payment', visited_at: nextTime() },
    })
    await prisma.prescription.create({
      data: {
        visit_id: visit.id,
        clinic_name: tmpl.clinic,
        doctor_name: tmpl.doctor,
        prescribed_at: new Date(today.toDateString()),
        items: { create: tmpl.items },
      },
    })
  }

  // ─── 검토(review) 10건 ───────────────────────────────────
  for (let i = 0; i < 10; i++) {
    const tmpl = prescriptionTemplates[i % prescriptionTemplates.length]
    const patient = nextPatient()
    const visit = await prisma.visit.create({
      data: { patient_id: patient.id, workflow_stage: 'review', visited_at: nextTime() },
    })
    await prisma.prescription.create({
      data: {
        visit_id: visit.id,
        clinic_name: tmpl.clinic,
        doctor_name: tmpl.doctor,
        prescribed_at: new Date(today.toDateString()),
        items: { create: tmpl.items },
      },
    })
  }

  // ─── 조제(dispensing) 15건 ───────────────────────────────
  for (let i = 0; i < 15; i++) {
    const tmpl = prescriptionTemplates[i % prescriptionTemplates.length]
    const patient = nextPatient()
    const visit = await prisma.visit.create({
      data: { patient_id: patient.id, workflow_stage: 'dispensing', visited_at: nextTime() },
    })
    await prisma.prescription.create({
      data: {
        visit_id: visit.id,
        clinic_name: tmpl.clinic,
        doctor_name: tmpl.doctor,
        prescribed_at: new Date(today.toDateString()),
        items: { create: tmpl.items },
      },
    })
  }

  // ─── 처방(prescription) 10건 ─────────────────────────────
  for (let i = 0; i < 10; i++) {
    const patient = nextPatient()
    await prisma.visit.create({
      data: { patient_id: patient.id, workflow_stage: 'prescription', visited_at: nextTime() },
    })
  }

  // ─── 접수(reception) 5건 ─────────────────────────────────
  for (let i = 0; i < 5; i++) {
    const patient = nextPatient()
    await prisma.visit.create({
      data: { patient_id: patient.id, workflow_stage: 'reception', visited_at: nextTime() },
    })
  }

  // ─── Plugin 설정 ──────────────────────────────────────────
  await prisma.pluginConfig.createMany({
    data: [
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
    ],
  })

  console.log(`✅ Seeded:
  - 2 users (admin / pharmacist1)
  - ${drugs.count} drugs
  - 10 clinics
  - ${patientList.length} patients
  - 150 visits (완료80, 청구15, 수납15, 검토10, 조제15, 처방10, 접수5)
  - plugins: dur, medication-guide`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
