import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

// Vercel Serverless에서 함수 인스턴스당 DB 연결 1개로 제한 (connection pool 초과 방지)
function buildDatasourceUrl(): string | undefined {
  const url = process.env.DATABASE_URL
  if (!url) return undefined
  if (process.env.NODE_ENV === 'production' && !url.includes('connection_limit')) {
    return `${url}${url.includes('?') ? '&' : '?'}connection_limit=1`
  }
  return url
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: buildDatasourceUrl() } },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
