import { Router } from 'express'
import { relationshipController } from '../controllers/relationshipController.js'

const router = Router()

router.get('/', (req, res) => relationshipController.getAll(req, res))
router.get('/:id', (req, res) => relationshipController.getById(req, res))
router.get('/member/:memberId', (req, res) => relationshipController.getByMemberId(req, res))
router.post('/', (req, res) => relationshipController.create(req, res))
router.put('/:id', (req, res) => relationshipController.update(req, res))
router.delete('/:id', (req, res) => relationshipController.delete(req, res))

export default router
