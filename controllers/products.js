var _ = require("underscore");

exports.listOfProducts = function(req, res) {
	console.log( "req.params: ", req.params)
	let category = req.params.id;
	const prods = req.app.locals.products;
	
	prods
		.find({primary_category_id: category})
		.toArray(function(err, items) {
			let arraySliceBegin = 0;
			let arraySliceEnd = 10 ;
						
			res.render(`shop/pages/products`, { 
				_ : _ ,
				totalItemCount: items.length,
				items : items.slice(arraySliceBegin,arraySliceEnd)
			});
		});
	
}

//@desc : CACHED MongoDB query PDP
exports.oneProductVariations = async function(req, res) {
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
		return res.render(`shop/pages/pdp`, {
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
		return res.render(`shop/pages/pdp`, {
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
}


exports.oneProduct = async function(req, res) {
	//new page - NEW cash
	let cache = {
		id: null, 
		target: null,
		recomendations: null
	}
	req.session.cache = cache;
	const prods = req.app.locals.products;
	let target = await prods.findOne({id: req.params.id});
	// console.log("target is: ",target);
	
	//create a regular expration for recomendations query
	var re = new RegExp(`\\b${target.primary_category_id}\\b`, "gi");
	
	//save recomendations in cache
	req.session.cache.recomendations = await prods
												.find({ primary_category_id: {$regex : re}})
												.toArray();
	req.session.cache.recomendations = req.session.cache.recomendations
												.slice(0,6)
												.filter(item =>
													item.id !== req.params.id
												);
	req.session.cache.id = req.params.id;
	//create variation of colors and sizes
	//if no size variations - put "ALL SIZE" to an according color
	let variations = {}
	if(target.variation_attributes) {
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
				if (variations[va.name].length>0) {
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
	}
	
	req.session.cache.target = target;
	req.session.cache.variations = variations || null;

	res.render(`shop/pages/pdp`, {
		_ : _ ,
		link: req.session.cache.link,
		size: req.session.cache.size,
		color: req.session.cache.color,
		variations: req.session.cache.variations,
		recomendations:req.session.cache.recomendations, 
		// breadcrumbs:breadcrumbs,
		item : req.session.cache.target
	});
};
