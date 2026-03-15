/**
 * Prisma 클라이언트 생성 스크립트
 * PRISMA_GENERATE_DATAPROXY 등 Data Proxy 관련 환경변수를 완전히 제거한 후
 * prisma generate를 실행 → 항상 표준 library 클라이언트 생성 보장
 */
const { execSync } = require('child_process')

const env = { ...process.env }

// Data Proxy / Accelerate 강제 생성 트리거 변수 완전 제거
// 참고: 값을 'false'로 설정하면 Prisma가 truthy로 인식할 수 있어 완전 제거가 안전
delete env.PRISMA_GENERATE_DATAPROXY
delete env.PRISMA_GENERATE_ACCELERATE
delete env.PRISMA_ACCELERATE_GENERATE
delete env.PRISMA_CLIENT_ENGINE_TYPE

execSync('npx prisma generate --schema=backend/prisma/schema.prisma', {
  stdio: 'inherit',
  env,
})
