const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  getServices, getService, createService,
  updateService, deleteService, getMyServices
} = require('../controllers/serviceController');

router.get('/',        getServices);
router.get('/mine',    protect, getMyServices);
router.get('/:id',     getService);
router.post('/',       protect, createService);
router.put('/:id',     protect, updateService);
router.delete('/:id',  protect, deleteService);

module.exports = router;
