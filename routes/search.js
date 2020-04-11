const express = require('express');
const router = express.Router();

const { searchProductByName } = require('../controllers/search');
	
router.get('/:query', searchProductByName);
module.exports = router;



