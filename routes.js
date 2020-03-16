
var _ = require("underscore");

exports.index = function(req, res) {
	res.render(`index`, { 
		title : "Wellcome",
		});
	};

exports.collectionsOfProducts = function(req, res) {
	const collection = req.app.locals.collection;
	const breadcrumbs = [...Object.values(req.params)]	
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
	const prods = req.app.locals.products;
	const breadcrumbs = [...Object.values(req.params)]
	if(req.params.level3){
		prods
			.find({primary_category_id: req.params.level3})
			.toArray(function(err, items) {
				res.render(`shop/item-list`, { 
					_ : _ ,
					breadcrumbs:breadcrumbs,
					items : items
				});
			});
	}
}

exports.oneProduct = function(req, res) {
	const prods = req.app.locals.products;
	const breadcrumbs = [...Object.values(req.params)]
	prods
		.findOne({id: req.params.prodID}, function(err, item) {
			res.render(`shop/final-sale-item`, {
				_ : _ , 
				breadcrumbs:breadcrumbs,
				item : item
			});
		});
	
}

