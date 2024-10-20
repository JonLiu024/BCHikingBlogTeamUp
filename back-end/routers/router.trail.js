const express = require('express');
const Trail = require('../Models/Trail')
const router = express.Router();
const {getAllTrails, getTrail, createTrail, updateTrail, deleteTrail} = require('../controllers/controller.trail')



router.get('/', getAllTrails);
router.get('/:id', getTrail);

router.post('/', createTrail);

router.put('/:id', updateTrail);
router.delete('/:id', deleteTrail);


module.exports = router