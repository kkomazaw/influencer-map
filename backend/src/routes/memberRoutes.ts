import { Router } from 'express'
import { memberController } from '../controllers/memberController.js'
import { authenticate } from '../middleware/auth'

const router = Router()

// 全ルートに認証を適用
router.use(authenticate)

router.get('/', (req, res) => memberController.getAll(req, res))
router.get('/:id', (req, res) => memberController.getById(req, res))
router.post('/', (req, res) => memberController.create(req, res))
router.put('/:id', (req, res) => memberController.update(req, res))
router.delete('/:id', (req, res) => memberController.delete(req, res))

export default router
