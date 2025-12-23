import { Router } from 'express'
import { groupController } from '../controllers/groupController.js'

const router = Router()

router.get('/', (req, res) => groupController.getAll(req, res))
router.get('/:id', (req, res) => groupController.getById(req, res))
router.post('/', (req, res) => groupController.create(req, res))
router.put('/:id', (req, res) => groupController.update(req, res))
router.delete('/:id', (req, res) => groupController.delete(req, res))

export default router
