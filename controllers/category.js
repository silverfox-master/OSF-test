const { renderTemplate , isInArray } = require("../helpers/render-helpers");

exports.getCategory = async function(req, res) {
    var _ = require("underscore");
	const collection = req.app.locals.collection;

	//TODO -- refactor breadcrumbs regarding new query architecture
	//const breadcrumbs = ["home", ...Object.values(req.params)]
	
	let queryCategories = req.params.id.split("-");
	let targetCategory = await collection.findOne({id: queryCategories[0]});

	// console.log("queryCategories are : ",queryCategories)
	
	if( queryCategories.length > 1 ) {
		// traverse nested categories and stop on target one to render
		let cat_array = [];
		queryCategories.forEach((element, index) => {
			if (index !== 0) {
				cat_array.push(element);
				targetCategory = targetCategory.categories.filter(item => {
					return isInArray(cat_array,item.id.split("-"));
				})[0];
			} else {
				cat_array.push(element);
			}
		});
	} 
	//fill in a context object to be passed to a template file
	const CONTEXT = {
		_  : _, 
		// TODO - fix BREADCRUMS breadcrumbs:breadcrumbs,
		items : targetCategory
	}

	renderTemplate(`shop/pages/category`,CONTEXT,res)
	
};