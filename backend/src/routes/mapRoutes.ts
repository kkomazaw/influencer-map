import { Router } from 'express'
import { mapController } from '../controllers/mapController'

const router = Router()

router.get('/', mapController.getAllMaps)
router.get('/:id', mapController.getMapById)
router.post('/', mapController.createMap)
router.put('/:id', mapController.updateMap)
router.delete('/:id', mapController.deleteMap)

export default router
