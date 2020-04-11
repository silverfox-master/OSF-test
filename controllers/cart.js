var _ = require("underscore");
const { renderTemplate } = require("../helpers/render-helpers");
//@desc:    add Item to Cart controler
//@route:   /cart/add/:id 
//@method:  POST
exports.addItemToCart = (req,res) => {
	let cart = (req.session.cart) ? req.session.cart : null;
	if (cart){
		let item = cart.items[req.body.id] ? cart.items[req.body.id] : null
		if (item){
			cart.items[req.body.id].quantity +=1
		} else{
			let temp_item = {
				quantity: 1,
				color: null,
				size: null
			}
			cart.items[req.body.id] = temp_item
			
		}
		cart.total_item_count +=1
		cart.total_price += Number(req.body.price)
	} else {
		let temp_cart = {
			items: {},
			total_item_count : 0,
			total_price : 0.00
		};
		let temp_item = {
			quantity: 1,
			color: null,
			size: null
		}
		temp_cart.items[req.body.id] = temp_item ;
		temp_cart.total_item_count +=1
		temp_cart.total_price += Number(req.body.price)
		
		req.session.cart = temp_cart;
	}
	res.redirect(req.header('Referer') || '/');
}

//@desc:    remove Item from Cart controler
//@route:   /cart/remove/:id 
//@method:  POST
exports.removeItemFromCart = (req,res)=> {
	
	let cart = (req.session.cart) ? req.session.cart : null;
	
	if (cart){
		let item = cart.items[req.body.id] ? cart.items[req.body.id] : null
		if (item > 1){
			cart.items[req.body.id].quantity -=1
		} else{
			delete  cart.items[req.body.id];
		}
		cart.total_item_count -=1
		cart.total_price -= Number(req.body.price)
	} else {
		console.log("nothing to remove, cart is: ", req.session.cart)
	}
	
	// console.log("cart is: ", req.session.cart)
	res.redirect(req.header('Referer') || '/');
}



//@desc:    remove ALL Items from Cart controler
//@route:   /cart/removeall 
//@method:  POST
exports.removeAllItemsFromCart = (req,res) => {
	
	let cart = (req.session.cart) ? req.session.cart : null;
	const id = (req.body.id) ? req.body.id : null
	
	if (id){
		cart.total_item_count -= req.session.cart.items[id].quantity
		cart.total_price -= req.session.cart.items[id].quantity * Number(req.body.price)
		delete req.session.cart.items[id]
	} else {
		if(cart){
			delete req.session.cart
		}
	}
	
	res.redirect(req.header('Referer') || '/');
};


//@desc:    show Cart controler
//@route:   /cart 
//@method:  GET
exports.getCart = async (req,res) => {
	const prods = req.app.locals.products;
	let queryItemsFromCart =[] ;
	let message = "";
	const cart = (req.session.cart) ? req.session.cart : null;
	if ( cart ) {
		message = `Number of items in cart ${req.session.cart.total_item_count}`;

		for (item in req.session.cart.items){
			data = await prods.findOne({id: item}) // function(err, q_item) {
			queryItemsFromCart.push(data);
		}
	} else {
		message = `cart is empty - no current items of interest`
	}
	const CONTEXT = {
		_  : _, 
		msg: message,
		cart : req.session.cart,
		list : queryItemsFromCart 
	}
	renderTemplate(`shop/pages/cart`,CONTEXT,res)
	
}