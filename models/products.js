const mongoose = require('mongoose');

const ProductsSchema = new mongoose.Schema({
    price_max: {
        type: Number
    },
    c_isNew: {
        type: Boolean
    },
    c_isNewtest: {
        type: Boolean
    },
    page_description: {
        type: String
    },
    c_styleNumber: {
        type: String
    },
    brand: {
        type: String
    },
    page_title: {
        type: String
    },
    c_tabDescription: {
        type: String
    },
    c_tabDetails: {
        type: String
    },
    page_keywords: {
        type: String
    },
    name: {
        type: String
    },
    price: {
        type: Number
    },
    variation_attributes: {
        type: [{
            id: {
                type: String
            },
            name: {
                type: String
            },
            values: {
                type: [{
                    name: {
                        type: String
                    },
                    orderable: {
                        type: Boolean
                    },
                    value: {
                        type: String
                    }
                }]
            }
        }]
    },
    id: {
        type: String
    },
    currency: {
        type: String
    },
    master: {
        orderable: {
            type: Boolean
        },
        price: {
            type: Number
        },
        master_id: {
            type: String
        }
    },
    primary_category_id: {
        type: String
    },
    image_groups: {
        type: [{
            images: {
                type: [{
                    alt: {
                        type: String
                    },
                    link: {
                        type: String
                    },
                    title: {
                        type:String
                    }
                }],
            }, 
            variation_value: {
                type: String
            },
            view_type: {
                type: String
            }
        }]
    },
    short_description: {
        type: String
    },
    orderable: {
        type: Boolean
    },
    variants: {
        type: [{
            orderable: {
                type: Boolean
            },
            price: {
                type: Number
            },
            product_id: {
                type: String
            },
            variation_values: {
                accessorySize: {
                    type: String
                },
                color: {
                    type: String
                },
                size: {
                    type: String
                },
                width: {
                    type: String
                },
            }
        }]
    },
    type: {
        master: {
            type: Boolean
        },
        item: {
            type: Boolean
        },
        option: {
            type: Boolean
        },
        set: {
            type: Boolean
        },
    },
    long_description: {
        type: String
    },
    c_isSale: {
        type: Boolean
    }
})

module.exports = mongoose.model('Products',ProductsSchema,'products');
