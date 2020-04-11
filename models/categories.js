const mongoose = require('mongoose');

const CategoriesSchema = new mongoose.Schema({
  c_showInMenu:{
    type:Boolean,
    default:true
  },
  categories: {
    type: [{
      c_showInMenu:{
        type:Boolean,
        default:true
      },
      categories: {
        type: [{
          c_showInMenu:{
            type:Boolean,
            default:true
          },
          id: {
            type: String
          },
          image: {
            type: String,
          },
          name: {
            type: String,
          },
          page_description: {
            type: String
          },
          page_keywords: {
            type: String
          },
          page_title: {
            type: String
          },
          parent_category_id: {
            type: String
          },
        }]
      },
      id: {
        type: String
      },
      image: {
        type: String,
      },
      name: {
        type: String,
      },
      page_description: {
        type: String
      },
      page_title: {
        type: String
      },
      parent_category_id: {
        type: String
      },
    }]  
  },
  id: {
    type: String
  },
  name: {
    type: String,
  },
  page_description: {
    type: String
  },
  page_title: {
    type: String
  },
  parent_category_id: {
    type: String
  },
})

module.exports = mongoose.model('Categories',CategoriesSchema,'categories');
