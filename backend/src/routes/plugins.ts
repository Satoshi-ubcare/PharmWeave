import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { validate } from '../middlewares/validate'
import { AppError } from '../middlewares/errorHandler'
import { executeMedicationGuide } from '../plugins/medicationGuide'
import { executeDur } from '../plugins/durPlugin'

const router = Router()

const toggleSchema = z.object({ enabled: z.boolean() })
const executeSchema = z.object({ visitId: z.string().uuid() })

router.get('/', async (_req, res) => {
  const plugins = await prisma.pluginConfig.findMany()
  res.json(plugins)
})

router.patch('/:id', validate(toggleSchema), async (req, res) => {
  const { enabled } = req.body as z.infer<typeof toggleSchema>
  const plugin = await prisma.pluginConfig.findUnique({ where: { id: req.params.id } })
  if (!plugin) throw new AppError(404, 'Plugin을 찾을 수 없습니다.')

  const updated = await prisma.pluginConfig.update({
    where: { id: req.params.id },
    data: { enabled },
  })
  res.json(updated)
})

router.post('/:id/execute', validate(executeSchema), async (req, res) => {
  const { id } = req.params
  const { visitId } = req.body as z.infer<typeof executeSchema>

  const plugin = await prisma.pluginConfig.findUnique({ where: { id } })
  if (!plugin) throw new AppError(404, 'Plugin을 찾을 수 없습니다.')
  if (!plugin.enabled) {
    res.json({ skipped: true, reason: 'Plugin이 비활성화되어 있습니다.' })
    return
  }

  switch (id) {
    case 'medication-guide': {
      const result = await executeMedicationGuide(visitId, prisma)
      res.json(result)
      break
    }
    case 'dur': {
      const result = await executeDur(visitId, prisma)
      res.json(result)
      break
    }
    default:
      throw new AppError(400, `알 수 없는 Plugin: ${id}`)
  }
})

export default router
