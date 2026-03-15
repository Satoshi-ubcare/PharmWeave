import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../middlewares/validate'
import { PluginService } from '../services/PluginService'

const router = Router()
const pluginService = new PluginService()

const toggleSchema = z.object({ enabled: z.boolean() })
const executeSchema = z.object({ visitId: z.string().uuid() })

router.get('/', async (_req, res) => {
  const plugins = await pluginService.list()
  res.json(plugins)
})

router.patch('/:id', validate(toggleSchema), async (req, res) => {
  const { enabled } = req.body as z.infer<typeof toggleSchema>
  const plugin = await pluginService.toggle(req.params.id, enabled)
  res.json(plugin)
})

router.post('/:id/execute', validate(executeSchema), async (req, res) => {
  const { visitId } = req.body as z.infer<typeof executeSchema>
  const result = await pluginService.execute(req.params.id, visitId)
  res.json(result)
})

export default router
