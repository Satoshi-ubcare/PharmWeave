import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  Clearing existing data...')

  // 외래키 순서에 맞춰 삭제
  await prisma.claim.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.prescriptionItem.deleteMany()
  await prisma.prescription.deleteMany()
  await prisma.visit.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.drug.deleteMany()
  await prisma.pluginConfig.deleteMany()
  await prisma.user.deleteMany()

  console.log('🌱 Seeding database...')

  // ─── 사용자 계정 ──────────────────────────────────────────
  await prisma.user.create({
    data: {
      username: 'admin',
      password_hash: await bcrypt.hash('admin1234', 10),
    },
  })
  await prisma.user.create({
    data: {
      username: 'pharmacist1',
      password_hash: await bcrypt.hash('pass1234', 10),
    },
  })

  // ─── 약품 마스터 (30개) ───────────────────────────────────
  const drugs = await prisma.drug.createMany({
    data: [
      // 항생제
      { drug_code: '644900060', drug_name: '아목시실린캡슐250mg', unit_price: 120 },
      { drug_code: '644900061', drug_name: '아목시실린캡슐500mg', unit_price: 180 },
      { drug_code: '629900010', drug_name: '아지스로마이신정250mg', unit_price: 580 },
      { drug_code: '629900011', drug_name: '클래리스로마이신정500mg', unit_price: 420 },
      { drug_code: '629900012', drug_name: '세파클러캡슐250mg', unit_price: 310 },
      // 해열·진통·소염
      { drug_code: '497000540', drug_name: '타이레놀정500mg', unit_price: 85 },
      { drug_code: '497000541', drug_name: '이부프로펜정200mg', unit_price: 95 },
      { drug_code: '497000542', drug_name: '나프록센정250mg', unit_price: 115 },
      { drug_code: '200300670', drug_name: '덱사메타손정0.5mg', unit_price: 65 },
      { drug_code: '200300671', drug_name: '프레드니솔론정5mg', unit_price: 110 },
      // 당뇨
      { drug_code: '170300040', drug_name: '메트포르민정500mg', unit_price: 75 },
      { drug_code: '170300041', drug_name: '글리피자이드정5mg', unit_price: 140 },
      { drug_code: '170300042', drug_name: '시타글립틴정100mg', unit_price: 850 },
      { drug_code: '170300043', drug_name: '다파글리플로진정10mg', unit_price: 1200 },
      // 고혈압
      { drug_code: '218500020', drug_name: '에날라프릴정5mg', unit_price: 130 },
      { drug_code: '218500021', drug_name: '로사르탄칼륨정50mg', unit_price: 160 },
      { drug_code: '218500022', drug_name: '암로디핀정5mg', unit_price: 145 },
      { drug_code: '218500023', drug_name: '발사르탄정80mg', unit_price: 175 },
      // 고지혈증
      { drug_code: '228500010', drug_name: '아토르바스타틴정10mg', unit_price: 220 },
      { drug_code: '228500011', drug_name: '로수바스타틴정5mg', unit_price: 195 },
      { drug_code: '228500012', drug_name: '피타바스타틴정2mg', unit_price: 260 },
      // 소화기
      { drug_code: '232000010', drug_name: '오메프라졸캡슐20mg', unit_price: 175 },
      { drug_code: '232000011', drug_name: '판토프라졸정40mg', unit_price: 185 },
      { drug_code: '119000030', drug_name: '에스오메프라졸정20mg', unit_price: 210 },
      { drug_code: '119000031', drug_name: '란소프라졸캡슐15mg', unit_price: 190 },
      // 알레르기
      { drug_code: '260200070', drug_name: '세티리진정10mg', unit_price: 145 },
      { drug_code: '260200071', drug_name: '로라타딘정10mg', unit_price: 135 },
      { drug_code: '260200072', drug_name: '펙소페나딘정120mg', unit_price: 280 },
      // 비타민·영양제
      { drug_code: '100000010', drug_name: '비타민C정1000mg', unit_price: 55 },
      { drug_code: '100000011', drug_name: '비타민D3정1000IU', unit_price: 70 },
    ],
  })

  // ─── 환자 15명 ────────────────────────────────────────────
  const patientList = await Promise.all([
    prisma.patient.create({ data: { name: '김민준', birth_date: new Date('1975-03-15'), phone: '01012345678' } }),
    prisma.patient.create({ data: { name: '이서연', birth_date: new Date('1988-07-22'), phone: '01098765432' } }),
    prisma.patient.create({ data: { name: '박지호', birth_date: new Date('1965-11-08'), phone: '01055556666' } }),
    prisma.patient.create({ data: { name: '최유나', birth_date: new Date('1992-05-30'), phone: null } }),
    prisma.patient.create({ data: { name: '정도현', birth_date: new Date('1950-09-01'), phone: '01077778888' } }),
    prisma.patient.create({ data: { name: '한수진', birth_date: new Date('1983-02-14'), phone: '01033334444' } }),
    prisma.patient.create({ data: { name: '오태양', birth_date: new Date('1998-12-05'), phone: '01022223333' } }),
    prisma.patient.create({ data: { name: '윤지민', birth_date: new Date('1971-06-18'), phone: '01044445555' } }),
    prisma.patient.create({ data: { name: '장현우', birth_date: new Date('1960-08-25'), phone: '01066667777' } }),
    prisma.patient.create({ data: { name: '임소희', birth_date: new Date('2001-04-12'), phone: null } }),
    prisma.patient.create({ data: { name: '강민서', birth_date: new Date('1978-10-30'), phone: '01088889999' } }),
    prisma.patient.create({ data: { name: '신재원', birth_date: new Date('1955-01-20'), phone: '01011112222' } }),
    prisma.patient.create({ data: { name: '류하은', birth_date: new Date('1995-09-08'), phone: '01099990000' } }),
    prisma.patient.create({ data: { name: '홍길동', birth_date: new Date('1985-07-04'), phone: '01012341234' } }),
    prisma.patient.create({ data: { name: '김영희', birth_date: new Date('1942-03-22'), phone: '01056785678' } }),
  ])

  // ─── 오늘 날짜 기준 방문 + 처방 + 수납 + 청구 생성 ────────
  const today = new Date()
  const t = (h: number, m: number) => {
    const d = new Date(today)
    d.setHours(h, m, 0, 0)
    return d
  }

  // 1. 처방 단계 — 김민준 (처방전 입력 중)
  await prisma.visit.create({
    data: {
      patient_id: patientList[0].id,
      workflow_stage: 'prescription',
      visited_at: t(9, 5),
    },
  })

  // 2. 처방 단계 — 이서연
  await prisma.visit.create({
    data: {
      patient_id: patientList[1].id,
      workflow_stage: 'prescription',
      visited_at: t(9, 20),
    },
  })

  // 3. 조제 단계 — 박지호 (처방 저장 완료, 조제 중)
  const visit3 = await prisma.visit.create({
    data: {
      patient_id: patientList[2].id,
      workflow_stage: 'dispensing',
      visited_at: t(9, 35),
    },
  })
  await prisma.prescription.create({
    data: {
      visit_id: visit3.id,
      clinic_name: '연세내과의원',
      doctor_name: '이민호',
      prescribed_at: new Date(today.toDateString()),
      items: {
        create: [
          { drug_code: '170300040', drug_name: '메트포르민정500mg', unit_price: 75, quantity: 2, days: 30 },
          { drug_code: '218500021', drug_name: '로사르탄칼륨정50mg', unit_price: 160, quantity: 1, days: 30 },
          { drug_code: '228500010', drug_name: '아토르바스타틴정10mg', unit_price: 220, quantity: 1, days: 30 },
        ],
      },
    },
  })

  // 4. 조제 단계 — 최유나
  const visit4 = await prisma.visit.create({
    data: {
      patient_id: patientList[3].id,
      workflow_stage: 'dispensing',
      visited_at: t(9, 50),
    },
  })
  await prisma.prescription.create({
    data: {
      visit_id: visit4.id,
      clinic_name: '강남이비인후과',
      doctor_name: null,
      prescribed_at: new Date(today.toDateString()),
      items: {
        create: [
          { drug_code: '644900060', drug_name: '아목시실린캡슐250mg', unit_price: 120, quantity: 2, days: 5 },
          { drug_code: '260200070', drug_name: '세티리진정10mg', unit_price: 145, quantity: 1, days: 5 },
          { drug_code: '497000540', drug_name: '타이레놀정500mg', unit_price: 85, quantity: 3, days: 5 },
        ],
      },
    },
  })

  // 5. 검토 단계 — 정도현
  const visit5 = await prisma.visit.create({
    data: {
      patient_id: patientList[4].id,
      workflow_stage: 'review',
      visited_at: t(10, 10),
    },
  })
  await prisma.prescription.create({
    data: {
      visit_id: visit5.id,
      clinic_name: '서울내과',
      doctor_name: '박성호',
      prescribed_at: new Date(today.toDateString()),
      items: {
        create: [
          { drug_code: '170300040', drug_name: '메트포르민정500mg', unit_price: 75, quantity: 2, days: 90 },
          { drug_code: '170300041', drug_name: '글리피자이드정5mg', unit_price: 140, quantity: 1, days: 90 },
          { drug_code: '218500020', drug_name: '에날라프릴정5mg', unit_price: 130, quantity: 1, days: 90 },
        ],
      },
    },
  })

  // 6. 검토 단계 — 한수진
  const visit6 = await prisma.visit.create({
    data: {
      patient_id: patientList[5].id,
      workflow_stage: 'review',
      visited_at: t(10, 25),
    },
  })
  await prisma.prescription.create({
    data: {
      visit_id: visit6.id,
      clinic_name: '미소피부과',
      doctor_name: '김지수',
      prescribed_at: new Date(today.toDateString()),
      items: {
        create: [
          { drug_code: '200300671', drug_name: '프레드니솔론정5mg', unit_price: 110, quantity: 1, days: 7 },
          { drug_code: '260200072', drug_name: '펙소페나딘정120mg', unit_price: 280, quantity: 1, days: 7 },
        ],
      },
    },
  })

  // 7. 수납 단계 — 오태양
  const visit7 = await prisma.visit.create({
    data: {
      patient_id: patientList[6].id,
      workflow_stage: 'payment',
      visited_at: t(10, 40),
    },
  })
  await prisma.prescription.create({
    data: {
      visit_id: visit7.id,
      clinic_name: '한빛정형외과',
      doctor_name: '최준영',
      prescribed_at: new Date(today.toDateString()),
      items: {
        create: [
          { drug_code: '497000541', drug_name: '이부프로펜정200mg', unit_price: 95, quantity: 3, days: 7 },
          { drug_code: '497000542', drug_name: '나프록센정250mg', unit_price: 115, quantity: 2, days: 7 },
        ],
      },
    },
  })

  // 8. 수납 단계 — 윤지민
  const visit8 = await prisma.visit.create({
    data: {
      patient_id: patientList[7].id,
      workflow_stage: 'payment',
      visited_at: t(11, 0),
    },
  })
  await prisma.prescription.create({
    data: {
      visit_id: visit8.id,
      clinic_name: '광화문내과의원',
      doctor_name: '이상훈',
      prescribed_at: new Date(today.toDateString()),
      items: {
        create: [
          { drug_code: '218500022', drug_name: '암로디핀정5mg', unit_price: 145, quantity: 1, days: 60 },
          { drug_code: '228500011', drug_name: '로수바스타틴정5mg', unit_price: 195, quantity: 1, days: 60 },
          { drug_code: '232000010', drug_name: '오메프라졸캡슐20mg', unit_price: 175, quantity: 1, days: 60 },
        ],
      },
    },
  })

  // 9. 청구 단계 — 장현우 (수납 완료)
  const visit9 = await prisma.visit.create({
    data: {
      patient_id: patientList[8].id,
      workflow_stage: 'claim',
      visited_at: t(11, 15),
    },
  })
  await prisma.prescription.create({
    data: {
      visit_id: visit9.id,
      clinic_name: '중앙병원',
      doctor_name: '박재현',
      prescribed_at: new Date(today.toDateString()),
      items: {
        create: [
          { drug_code: '629900010', drug_name: '아지스로마이신정250mg', unit_price: 580, quantity: 1, days: 3 },
          { drug_code: '497000540', drug_name: '타이레놀정500mg', unit_price: 85, quantity: 3, days: 3 },
        ],
      },
    },
  })
  const totalDrugCost9 = 580 * 1 * 3 + 85 * 3 * 3 // 2505
  await prisma.payment.create({
    data: {
      visit_id: visit9.id,
      total_drug_cost: 2505,
      copay_amount: Math.round(2505 * 0.2),
      insurance_coverage: 2505 - Math.round(2505 * 0.2),
      payment_method: 'card',
    },
  })

  // 10. 청구 단계 — 임소희
  const visit10 = await prisma.visit.create({
    data: {
      patient_id: patientList[9].id,
      workflow_stage: 'claim',
      visited_at: t(11, 30),
    },
  })
  await prisma.prescription.create({
    data: {
      visit_id: visit10.id,
      clinic_name: '드림소아과',
      doctor_name: '정혜진',
      prescribed_at: new Date(today.toDateString()),
      items: {
        create: [
          { drug_code: '644900060', drug_name: '아목시실린캡슐250mg', unit_price: 120, quantity: 2, days: 7 },
          { drug_code: '260200071', drug_name: '로라타딘정10mg', unit_price: 135, quantity: 1, days: 7 },
          { drug_code: '100000010', drug_name: '비타민C정1000mg', unit_price: 55, quantity: 1, days: 7 },
        ],
      },
    },
  })
  const totalDrugCost10 = 120 * 2 * 7 + 135 * 1 * 7 + 55 * 1 * 7
  await prisma.payment.create({
    data: {
      visit_id: visit10.id,
      total_drug_cost: totalDrugCost10,
      copay_amount: Math.round(totalDrugCost10 * 0.3),
      insurance_coverage: totalDrugCost10 - Math.round(totalDrugCost10 * 0.3),
      payment_method: 'cash',
    },
  })

  // 11. 완료 — 강민서 (오전 케이스)
  const visit11 = await prisma.visit.create({
    data: {
      patient_id: patientList[10].id,
      workflow_stage: 'completed',
      visited_at: t(8, 30),
    },
  })
  const rx11 = await prisma.prescription.create({
    data: {
      visit_id: visit11.id,
      clinic_name: '하나안과',
      doctor_name: '유진철',
      prescribed_at: new Date(today.toDateString()),
      items: {
        create: [
          { drug_code: '200300670', drug_name: '덱사메타손정0.5mg', unit_price: 65, quantity: 4, days: 5 },
        ],
      },
    },
  })
  const totalDrugCost11 = 65 * 4 * 5
  const pay11 = await prisma.payment.create({
    data: {
      visit_id: visit11.id,
      total_drug_cost: totalDrugCost11,
      copay_amount: Math.round(totalDrugCost11 * 0.2),
      insurance_coverage: totalDrugCost11 - Math.round(totalDrugCost11 * 0.2),
      payment_method: 'card',
    },
  })
  await prisma.claim.create({
    data: {
      visit_id: visit11.id,
      claim_status: 'submitted',
      claim_data: {
        visit_id: visit11.id,
        patient_name: patientList[10].name,
        birth_date: '1978-10-30',
        clinic_name: '하나안과',
        doctor_name: '유진철',
        prescribed_at: today.toISOString().split('T')[0],
        items: [{ drug_code: '200300670', drug_name: '덱사메타손정0.5mg', quantity: 4, days: 5, total: totalDrugCost11 }],
        total_drug_cost: totalDrugCost11,
        copay_amount: pay11.copay_amount,
        insurance_coverage: pay11.insurance_coverage,
        claimed_at: new Date().toISOString(),
      },
    },
  })

  // 12. 완료 — 신재원 (오전 케이스)
  const visit12 = await prisma.visit.create({
    data: {
      patient_id: patientList[11].id,
      workflow_stage: 'completed',
      visited_at: t(8, 50),
    },
  })
  const totalDrugCost12 = 75 * 2 * 90 + 160 * 1 * 90
  const pay12 = await prisma.payment.create({
    data: {
      visit_id: visit12.id,
      total_drug_cost: totalDrugCost12,
      copay_amount: Math.round(totalDrugCost12 * 0.3),
      insurance_coverage: totalDrugCost12 - Math.round(totalDrugCost12 * 0.3),
      payment_method: 'transfer',
    },
  })
  await prisma.prescription.create({
    data: {
      visit_id: visit12.id,
      clinic_name: '신촌내과',
      doctor_name: '강태호',
      prescribed_at: new Date(today.toDateString()),
      items: {
        create: [
          { drug_code: '170300040', drug_name: '메트포르민정500mg', unit_price: 75, quantity: 2, days: 90 },
          { drug_code: '218500021', drug_name: '로사르탄칼륨정50mg', unit_price: 160, quantity: 1, days: 90 },
        ],
      },
    },
  })
  await prisma.claim.create({
    data: {
      visit_id: visit12.id,
      claim_status: 'approved',
      claim_data: {
        visit_id: visit12.id,
        patient_name: patientList[11].name,
        birth_date: '1955-01-20',
        clinic_name: '신촌내과',
        prescribed_at: today.toISOString().split('T')[0],
        total_drug_cost: totalDrugCost12,
        copay_amount: pay12.copay_amount,
        insurance_coverage: pay12.insurance_coverage,
        claimed_at: new Date().toISOString(),
      },
    },
  })

  // 13. 접수 단계 — 류하은 (방금 도착)
  await prisma.visit.create({
    data: {
      patient_id: patientList[12].id,
      workflow_stage: 'reception',
      visited_at: t(11, 50),
    },
  })

  // 14. 처방 단계 — 홍길동
  await prisma.visit.create({
    data: {
      patient_id: patientList[13].id,
      workflow_stage: 'prescription',
      visited_at: t(12, 0),
    },
  })

  // 15. 조제 단계 — 김영희
  const visit15 = await prisma.visit.create({
    data: {
      patient_id: patientList[14].id,
      workflow_stage: 'dispensing',
      visited_at: t(12, 10),
    },
  })
  await prisma.prescription.create({
    data: {
      visit_id: visit15.id,
      clinic_name: '노인전문의원',
      doctor_name: '이철수',
      prescribed_at: new Date(today.toDateString()),
      items: {
        create: [
          { drug_code: '218500023', drug_name: '발사르탄정80mg', unit_price: 175, quantity: 1, days: 30 },
          { drug_code: '228500012', drug_name: '피타바스타틴정2mg', unit_price: 260, quantity: 1, days: 30 },
          { drug_code: '232000011', drug_name: '판토프라졸정40mg', unit_price: 185, quantity: 1, days: 30 },
          { drug_code: '100000011', drug_name: '비타민D3정1000IU', unit_price: 70, quantity: 1, days: 30 },
        ],
      },
    },
  })

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
  - ${patientList.length} patients
  - 15 visits (처방3, 조제3, 검토2, 수납2, 청구2, 완료2, 접수1)
  - plugins: dur, medication-guide`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
