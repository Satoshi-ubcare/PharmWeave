import 'express-async-errors'
import express from 'express'
import cors from 'cors'
import { errorHandler } from './middlewares/errorHandler'
import patientsRouter from './routes/patients'
import visitsRouter from './routes/visits'
import prescriptionsRouter from './routes/prescriptions'
import drugsRouter from './routes/drugs'
import paymentsRouter from './routes/payments'
import claimsRouter from './routes/claims'
import pluginsRouter from './routes/plugins'
import authRouter from './routes/auth'

const app = express()

app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*' }))
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

app.use('/api/auth', authRouter)
app.use('/api/patients', patientsRouter)
app.use('/api/visits', visitsRouter)
app.use('/api/visits', prescriptionsRouter)
app.use('/api/visits', paymentsRouter)
app.use('/api/visits', claimsRouter)
app.use('/api/drugs', drugsRouter)
app.use('/api/plugins', pluginsRouter)

app.use(errorHandler)

export default app

// 로컬 개발 환경에서만 서버 직접 실행
if (process.env.NODE_ENV !== 'production') {
  const PORT = Number(process.env.PORT ?? 3000)
  app.listen(PORT, () => console.log(`🚀 PharmWeave API running on port ${PORT}`))
}
