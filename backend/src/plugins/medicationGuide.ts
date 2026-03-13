import type { PrismaClient } from '@prisma/client'

interface MedicationGuideItem {
  drug_name: string
  how_to_take: string
  warnings: string[]
}

interface MedicationGuideResult {
  visitId: string
  guides: MedicationGuideItem[]
  generatedAt: string
}

const MEDICATION_WARNINGS: Record<string, string[]> = {
  default: ['식후 30분에 복용하세요.', '정해진 용량을 지켜주세요.'],
  아목시실린: ['알레르기 반응 시 즉시 복용을 중단하고 의사에게 연락하세요.', '식사와 관계없이 복용 가능합니다.'],
  타이레놀: ['음주 중에는 복용을 피하세요.', '하루 최대 4000mg을 초과하지 마세요.'],
  이부프로펜: ['식후 복용을 권장합니다.', '위장 장애가 있는 경우 의사와 상담하세요.'],
  메트포르민: ['식사 직후 복용하세요.', '조영제 검사 전 복용을 중단해야 할 수 있습니다.'],
  아토바스타틴: ['저녁 식후 복용을 권장합니다.', '근육통이 심하면 즉시 의사에게 알리세요.'],
}

function getWarnings(drugName: string): string[] {
  for (const [key, warnings] of Object.entries(MEDICATION_WARNINGS)) {
    if (key !== 'default' && drugName.includes(key)) return warnings
  }
  return MEDICATION_WARNINGS.default
}

export async function executeMedicationGuide(
  visitId: string,
  prisma: PrismaClient,
): Promise<MedicationGuideResult> {
  const prescription = await prisma.prescription.findUnique({
    where: { visit_id: visitId },
    include: { items: true },
  })

  if (!prescription) {
    return { visitId, guides: [], generatedAt: new Date().toISOString() }
  }

  const guides: MedicationGuideItem[] = prescription.items.map((item) => ({
    drug_name: item.drug_name,
    how_to_take: `1회 ${item.quantity}정, 하루 ${item.days}일 복용`,
    warnings: getWarnings(item.drug_name),
  }))

  return { visitId, guides, generatedAt: new Date().toISOString() }
}
