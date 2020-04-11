const express = require('express');
const router = express.Router();

const { getCategory } = require('../controllers/category');
	
router.get('/:id', getCategory);
module.exports = router;