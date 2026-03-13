export interface CopayResult {
  totalDrugCost: number
  copayAmount: number
  insuranceCoverage: number
}

export interface PrescriptionItemInput {
  unit_price: number
  quantity: number
  days: number
}

export class CopayCalculator {
  calculate(items: PrescriptionItemInput[]): CopayResult {
    if (items.length === 0) {
      throw new Error('처방 항목이 없습니다.')
    }

    const totalDrugCost = items.reduce(
      (sum, item) => sum + item.unit_price * item.quantity * item.days,
      0,
    )

    const rate = totalDrugCost < 10_000 ? 0.2 : 0.3
    const copayAmount = Math.round(totalDrugCost * rate)
    const insuranceCoverage = totalDrugCost - copayAmount

    return { totalDrugCost, copayAmount, insuranceCoverage }
  }
}
