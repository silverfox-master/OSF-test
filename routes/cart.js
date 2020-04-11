
const express = require('express');
const router = express.Router();

const {
    getCart,
    removeAllItemsFromCart,
    removeItemFromCart,
	addItemToCart } = require('../controllers/cart');
	
router.get('/', getCart);
router.post('/removeall', removeAllItemsFromCart);
router.post('/add/:id', addItemToCart)
router.post('/remove/:id', removeItemFromCart)

module.exports = router;








    // const { protect } = require('../middleware/auth');


