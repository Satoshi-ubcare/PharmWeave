export type InsuranceType =
  | 'health_insurance'
  | 'medical_aid_1'
  | 'medical_aid_2'
  | 'veterans'
  | 'industrial_accident'
  | 'auto_insurance'
  | 'self_pay'

export type CopayExemption =
  | 'none'
  | 'elderly'
  | 'disabled'
  | 'rare_disease'
  | 'pregnant'
  | 'infant'

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
  calculate(
    items: PrescriptionItemInput[],
    insuranceType: InsuranceType = 'health_insurance',
    copayExemption: CopayExemption = 'none',
  ): CopayResult {
    if (items.length === 0) {
      throw new Error('처방 항목이 없습니다.')
    }

    const totalDrugCost = items.reduce(
      (sum, item) => sum + item.unit_price * item.quantity * item.days,
      0,
    )

    const copayAmount = this.computeCopay(totalDrugCost, insuranceType, copayExemption)

    return {
      totalDrugCost,
      copayAmount,
      insuranceCoverage: totalDrugCost - copayAmount,
    }
  }

  private computeCopay(
    totalDrugCost: number,
    insuranceType: InsuranceType,
    copayExemption: CopayExemption,
  ): number {
    switch (insuranceType) {
      // 의료급여 1종: 500원 정액 (약제비가 500원 미만이면 약제비 전액)
      case 'medical_aid_1':
        return Math.min(500, totalDrugCost)

      // 의료급여 2종: 15%
      case 'medical_aid_2':
        return Math.round(totalDrugCost * 0.15)

      // 보훈 / 산재 / 자동차보험: 공단·보험사 전액 부담
      case 'veterans':
      case 'industrial_accident':
      case 'auto_insurance':
        return 0

      // 비급여: 전액 본인 부담
      case 'self_pay':
        return totalDrugCost

      // 건강보험: 경감 대상에 따라 차등 적용
      case 'health_insurance':
      default:
        return this.computeHealthInsuranceCopay(totalDrugCost, copayExemption)
    }
  }

  private computeHealthInsuranceCopay(
    totalDrugCost: number,
    copayExemption: CopayExemption,
  ): number {
    switch (copayExemption) {
      // 영유아 (만 1세 미만): 무료
      case 'infant':
        return 0

      // 노인 (65세 이상) 차등 정액제
      case 'elderly':
        if (totalDrugCost < 10_000) return 0
        if (totalDrugCost < 15_000) return 1_500
        return Math.round(totalDrugCost * 0.1)

      // 장애인 / 임산부: 20% 고정
      case 'disabled':
      case 'pregnant':
        return Math.round(totalDrugCost * 0.2)

      // 희귀·중증난치질환 산정특례: 10%
      case 'rare_disease':
        return Math.round(totalDrugCost * 0.1)

      // 일반 (경감 없음): 1만원 미만 20%, 이상 30%
      case 'none':
      default:
        return totalDrugCost < 10_000
          ? Math.round(totalDrugCost * 0.2)
          : Math.round(totalDrugCost * 0.3)
    }
  }
}
