
var _ = require("underscore");

exports.index = function(req, res) {
	res.render(`index`, { 
		title : "Wellcome",
		});
	};

exports.collectionsOfProducts = function(req, res) {
	const collection = req.app.locals.collection;
	const breadcrumbs = ["home", ...Object.values(req.params)]	
	collection.findOne({ id: req.params.level1 },function(err, items) {
		if(req.params.level2){
			c_arr = items.categories.filter(item =>{
				return item.id===req.params.level2
			})
			items = c_arr[0]
		};
		res.render(`shop/category-list`, { 
			_  : _, 
			breadcrumbs:breadcrumbs,
			items : items
		});
	});
};


exports.listOfProducts = function(req, res) {
	let page = req.params.pageID;
	const pageSize = req.app.locals.pageSize || 10;
	const prods = req.app.locals.products;
	const breadcrumbs = ["home", ...Object.values(req.params)]
	
	if(req.params.level3 && page==undefined){
		page = 0;
		breadcrumbs.push(0);
	}
	prods
		.find({primary_category_id: req.params.level3})
		.toArray(function(err, items) {
			let arraySliceBegin = 0;
			let arraySliceEnd = 10 ;
			if (page){
				arraySliceBegin = page * pageSize;
				arraySliceEnd = ( Number(page) + 1 ) * pageSize;
			}
			
			res.render(`shop/item-list`, { 
				_ : _ ,
				totalItemCount: items.length,
				breadcrumbs:breadcrumbs,
				currentPage: page,
				pageSize: 10,
				items : items.slice(arraySliceBegin,arraySliceEnd)
			});
		});
	
}


//@desc : CACHED MongoDB query PDP
exports.oneProduct = async function(req, res) {
	let breadcrumbs = ["home", ...Object.values(req.params)]
	console.log("breadcrumbs are:", breadcrumbs)
	if ( req.body.color || req.body.size || req.body.link ) {
		if(req.body.color){
			req.session.cache.color = req.body.color;
			req.session.cache.link = null;
		}
		if(req.body.size){
			req.session.cache.size = req.body.size ? req.body.size : req.session.cache.size;
		}
		if(req.body.link){
			req.session.cache.link = req.body.link ? req.body.link : req.session.cache.link;
		}
		return res.render(`shop/final-sale-item`, {
			_ : _ ,

			link: req.session.cache.link,
			size: req.session.cache.size,
			color: req.session.cache.color,
			variations: req.session.cache.variations,
			recomendations:req.session.cache.recomendations, 
			breadcrumbs:breadcrumbs,
			item : req.session.cache.target
		});
	};

	const prods = req.app.locals.products;
	
	//check if cache exists - if not create a new one.
	if (!req.session.cache){
		let cache = {
			id: null, 
			target: null,
			recomendations: null
		}
		req.session.cache = cache;
	};
	// simple redirect back in case of page reload
	if (req.session.cache.id == req.params.prodID){
		return res.render(`shop/final-sale-item`, {
					_ : _ ,
					link: req.session.cache.link,
					size: req.session.cache.size,
					color: req.session.cache.color,
					variations: req.session.cache.variations,
					recomendations:req.session.cache.recomendations, 
					breadcrumbs:breadcrumbs,
					item : req.session.cache.target
		});
	};

	//new page - clear cash
	req.session.cache.color = null;
	req.session.cache.size = null;
	req.session.cache.link = null;
	let target = await prods.findOne({id: req.params.prodID});
	
	//create a regular expration for recomendations query
	var re = new RegExp(`\\b${target.primary_category_id}\\b`, "gi");
	
	//save recomendations in cache
	req.session.cache.recomendations = await prods
												.find({ primary_category_id: {$regex : re}})
												.toArray();
	req.session.cache.recomendations = req.session.cache.recomendations
												.slice(0,6)
												.filter(item =>
													item.id !== req.params.prodID
												);
	req.session.cache.id = req.params.prodID;
	//create variation of colors and sizes
	//if no size variations - put "ALL SIZE" to an according color
	let variations = {}

	if(target.variation_attributes.length>1){
		target.variation_attributes[0].values.forEach(va => {
			let temp_chart = []
			target.variants.forEach(ent => {
				 if(ent.variation_values.color === va.value){
					temp_chart.push(
						target
						.variation_attributes[1]
						.values
						.filter(v => (v.value==ent.variation_values.size))[0]
						.name)
				}
			})
			variations[va.name] = temp_chart
			//console.log("routes 150 - variations: ",variations)
			if (variations[va.name].length>0) {
				//console.log("routes 152 - color: ",va.name)
				 if(!req.session.cache.color) {
					req.session.cache.color = va.name
				 }
				
			}
		})
	} else {
		target.variation_attributes[0].values.forEach(va => {
			let temp_chart = []
			target.image_groups.forEach(ent => {
				 if(ent.variation_value === va.value && ent.view_type == "large"){
					temp_chart.push("ALL SIZE")
				}
			})
			variations[va.name] = temp_chart
			
			if (variations[va.name].length>0) {
				if(!req.session.cache.color) {
					req.session.cache.color = va.name
				}
			}
		})
	}
	
	req.session.cache.target = target;
	req.session.cache.variations = variations;

	res.render(`shop/final-sale-item`, {
		_ : _ ,
		link: req.session.cache.link,
		size: req.session.cache.size,
		color: req.session.cache.color,
		variations: req.session.cache.variations,
		recomendations:req.session.cache.recomendations, 
		breadcrumbs:breadcrumbs,
		item : req.session.cache.target
	});
};



//@desc:    Search query controler
//@route:   /search 
//@method:  GET
exports.searchProductByName = async function(req, res) {
	
	//chech for searchcache object - if none - create one
	if (!req.session.searchcache){
		let cache = {
			id: null, 
			searchResults: null
		}
		req.session.searchcache = cache;
	};
	// checl if new search word equals to the one in cache
	// if new word - then MongoDB query and set new data in cache
	if( req.query.search !== req.session.searchcache.id ){

		if( req.query.search==""){
			return res.render(`shop/search`,{ 
				_  : _, 
				msg: "no seach parametrs found",
				items : []
			});
		}
		const productCollection = req.app.locals.products;
		//create seach regex
		var re = new RegExp(`\\b${req.query.search}\\b`, "gi");
		searchRes = await productCollection
				.find({ name: {$regex : re}})
				.toArray()
		if(!searchRes){
			const alertMessage = `Sorry, no match found for ${req.query.search}`
			return res.render('shop/search',{
				msg: alertMessage,
				items: []
			});
		} else {
			const successMessage = `found ${searchRes.length} items for ${req.query.search}`
			//save mongoDB query results to session cache 
			req.session.searchcache.searchResults = searchRes;
			req.session.searchcache.id = req.query.search
			res.render(`shop/search`,{ 
				_  : _, 
				msg: successMessage,
				items : searchRes
			});
		}
	} else{
		// its the same query as the last one - so no need to adress to DB
		const successMessage = `found ${searchRes.length} items for ${req.query.search}`
		res.render(`shop/search`,{ 
			_  : _, 
			msg: successMessage,
			items : req.session.searchcache.searchResults
		});

	}
};

//@desc:    add Item to Cart controler
//@route:   /cart/add/:id 
//@method:  GET
exports.addItemToCart = function(req,res){
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
//@method:  DELETE
exports.removeItemFromCart = function(req,res){
	
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
//@route:   /cart/remove/all 
//@method:  DELETE
exports.removeAllItemsFromCart = function(req,res){
	
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
exports.getCart = async function(req,res){
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
	res.render(`shop/cart`,{ 
		_  : _, 
		msg: message,
		cart : req.session.cart,
		list : queryItemsFromCart
	});


}



