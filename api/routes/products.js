const express  = require('express');
const router = express.Router();
const Product = require('../models/product'); 
const mongoose = require('mongoose');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');
const productController = require('../controllers/products');
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads/');
    },
    filename: function(req, file, cb){
        cb(null, new Date().toDateString() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
  if(file.mimetype ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
    storage: storage, 
    limits: {
    fileSize: 1024 * 1024 * 5
},
fileFilter: fileFilter
});

// const upload = multer({storage: storage});
// Hendle get incomming request
router.get('/', checkAuth, productController.get_all_product);

router.post('/', checkAuth, upload.single('productImage'), (req, res, next) => {
console.log('req.body', req.body);
console.log('req.file', req.file);
    const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path
});
console.log('product', product);
product.save()
.then(result => {res.status(200).json(result)})
.catch(err => {
    res.status(500).json({
        message: 'database error',
        error: err
    });
});               
});

router.put('/:productId', (req, res, next) => {
    const id = req.params.productId;
    const updatedOps = {};
    for(const ops of req.body){
        console.log('ops', ops);
        updatedOps[ops.propName] = ops.value;
    }
    console.log('updatedOps', updatedOps);
    Product.update({_id: id}, { $set: updatedOps })
    .exec()
    .then(result => {res.status(200).json(result)})
    .catch(err => {res.status(500).json({error: err,
    message: "data not available"})});
    // res.status(200).json({
    //     message: 'Handling PUT request to /products'
    // });
});

router.delete('/:productId', (req, res, next) => {
    const id = req.params.productId;
    
    Product.findOneAndRemove({ _id: id })
    .exec()
    .then(result =>{
        res.status(200).json(result);
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    });
});

router.get('/:productId', (req, res, next) => {
    var id = req.params.productId;
    console.log('id-------', id);
Product.findById({ _id: id }).exec()
.select('name price _id productImage')
.then(docs => { 
    console.log('docs-------', docs);
    // console.log('docs.length-------', docs.length);
    if(docs) {
        res.status(200).json(docs);
    } else {
        res.status(400).json({
            message: "No record Found" + id
        });
    }
    
   
}).catch(err => {
    res.status(500).json({ 
        message: "No valid entry found this id",
     })
    });
});

module.exports = router;