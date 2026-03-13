import type { PrismaClient } from '@prisma/client'

interface DurWarning {
  drug_a: string
  drug_b: string
  severity: 'high' | 'moderate' | 'low'
  message: string
}

interface DurResult {
  visitId: string
  warnings: DurWarning[]
  checkedAt: string
  status: 'safe' | 'warning'
}

// 약물 상호작용 규칙 (데모용 샘플)
const INTERACTION_RULES: Array<{
  drugs: string[]
  severity: 'high' | 'moderate' | 'low'
  message: string
}> = [
  {
    drugs: ['아목시실린', '클래리스로마이신'],
    severity: 'moderate',
    message: '두 항생제를 동시에 복용하면 효과가 감소할 수 있습니다. 의사에게 확인하세요.',
  },
  {
    drugs: ['이부프로펜', '아스피린'],
    severity: 'high',
    message: '위장 출혈 위험이 증가합니다. 동시 복용을 피하세요.',
  },
  {
    drugs: ['메트포르민', '글리피자이드'],
    severity: 'low',
    message: '저혈당 위험이 증가할 수 있습니다. 혈당을 자주 확인하세요.',
  },
]

export async function executeDur(visitId: string, prisma: PrismaClient): Promise<DurResult> {
  const prescription = await prisma.prescription.findUnique({
    where: { visit_id: visitId },
    include: { items: true },
  })

  if (!prescription || prescription.items.length === 0) {
    return { visitId, warnings: [], checkedAt: new Date().toISOString(), status: 'safe' }
  }

  const drugNames = prescription.items.map((item) => item.drug_name)
  const warnings: DurWarning[] = []

  for (const rule of INTERACTION_RULES) {
    const matched = rule.drugs.filter((d) => drugNames.some((name) => name.includes(d)))
    if (matched.length >= 2) {
      warnings.push({
        drug_a: matched[0],
        drug_b: matched[1],
        severity: rule.severity,
        message: rule.message,
      })
    }
  }

  return {
    visitId,
    warnings,
    checkedAt: new Date().toISOString(),
    status: warnings.length > 0 ? 'warning' : 'safe',
  }
}
