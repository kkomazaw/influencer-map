import { Router } from 'express'
import { memberController } from '../controllers/memberController.js'

const router = Router()

router.get('/', (req, res) => memberController.getAll(req, res))
router.get('/:id', (req, res) => memberController.getById(req, res))
router.post('/', (req, res) => memberController.create(req, res))
router.put('/:id', (req, res) => memberController.update(req, res))
router.delete('/:id', (req, res) => memberController.delete(req, res))

export default router
