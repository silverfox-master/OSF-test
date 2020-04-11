var _ = require("underscore");

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