const express = require('express');
const router = express.Router();

const {
    oneProductVariations,
    listOfProducts,
    oneProduct,
} = require('../controllers/products');
	
router.get('/:id', oneProduct);
router.post('/:id', oneProductVariations);
router.get('/category/:id', listOfProducts);


module.exports = router;








