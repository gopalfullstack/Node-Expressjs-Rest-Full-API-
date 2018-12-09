const Product = require('../models/product'); 
const mongoose = require('mongoose');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

exports.get_all_product =  (req, res, next) => {
    Product.find()
    .select('name price _id productImage')// for which selected field we need to get from database
    .exec()
    .then(docs => {
        console.log('doc------', docs);
        const response = {
            count: docs.length,
            product: docs.map(doc => {
                return {
                    name: doc.name,
                    price: doc.price,
                    _id: doc._id,
                    productImage: doc.productImage,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products/' + doc._id
                    }
                }
            })
        }
        res.status(200).json(response);
    })
    .catch(err => {
        console.log('err-------', err);
        // res.status(500).json({
        // error: err
    // });
});
   
}