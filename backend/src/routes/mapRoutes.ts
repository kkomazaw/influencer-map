import { Router } from 'express'
import { mapController } from '../controllers/mapController'
import { authenticate } from '../middleware/auth'

const router = Router()

// 全ルートに認証を適用
router.use(authenticate)

router.get('/', mapController.getAllMaps)
router.get('/:id', mapController.getMapById)
router.post('/', mapController.createMap)
router.put('/:id', mapController.updateMap)
router.delete('/:id', mapController.deleteMap)

export default router
