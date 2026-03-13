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

const PORT = Number(process.env.PORT ?? 3000)
app.listen(PORT, () => console.log(`🚀 PharmWeave API running on port ${PORT}`))

export default app
