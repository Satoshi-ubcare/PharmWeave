-- CreateEnum
CREATE TYPE "InsuranceType" AS ENUM ('health_insurance', 'medical_aid_1', 'medical_aid_2', 'veterans', 'industrial_accident', 'auto_insurance', 'self_pay');

-- CreateEnum
CREATE TYPE "CopayExemption" AS ENUM ('none', 'elderly', 'disabled', 'rare_disease', 'pregnant', 'infant');

-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "allergies" VARCHAR(500),
ADD COLUMN     "copay_exemption" "CopayExemption" NOT NULL DEFAULT 'none',
ADD COLUMN     "gender" CHAR(1),
ADD COLUMN     "insurance_type" "InsuranceType" NOT NULL DEFAULT 'health_insurance';
