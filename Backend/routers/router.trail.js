const express = require('express');
const router = express.Router();



router.get('/', getAllTrails);
router.get('/:id', getTrail);

router.post('/', createTrail);

router.put('/:id', updateTrail);
router.delete('/:id', deleteTrail);


module.export = router