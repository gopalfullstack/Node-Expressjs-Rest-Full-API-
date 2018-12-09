const express = require('express');
const route = express.Router();
const Order = require('../models/order'); 
const mongoose = require('mongoose');
const Product = require('../models/product');
route.get('/', (req, res, next) => {
   Order.find()
        .select('_id product quantity')
        .exec()
        .then(docs => {
            res.status(200).json({
                count: docs.length,
                orders: docs.map(doc => {
                    return {
                        _id: doc._id,
                        product: doc.product,
                        quantity: doc.quantity,
                        request: {
                           type: 'GET',
                           url: 'http://localhost:3000/orders/' +doc._id
                        } 
                    }
                })
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        })
});

route.post('/', (req, res, next) => {
    console.log('req.body.productId', req.body.productId);
    Product.findById(req.body.productId)
            .then(product => {
                console.log('product', product);
                if(!product) {
                    return res.status(404).json({
                        message: 'Product not found'
                    });
                     }
                const order = new Order({
                    _id: mongoose.Types.ObjectId(),
                    quantity: req.body.quantity,
                    product: req.body.productId,
                });
               return order.save();               
            })
            .then(result=>{
                console.log('result', result);
                res.status(201).json({
                    message: 'Order stored successfully',
                    createdOrder: {
                        _id: result._id,
                        product: result.product,
                        quantity: result.quantity
                    },
                    request: {
                        type: 'POST',
                        url: 'http://localhost:3000/orders/' +result._id
                    }
                });
            })
           .catch(err => {
                res.status(500).json({
                    message: 'database error',
                    error: err
                });
            });               
});

route.put('/:orderId', (req, res, next) => {
    const id = req.params.orderId;
    const updatedOps = {};
    for(const ops of req.body){
        console.log('ops', ops);
        updatedOps[ops.propName] = ops.value;
    }
    console.log('updatedOps', updatedOps);
    Order.update({_id: id}, { $set: updatedOps })
    .exec()
    .then(result => {res.status(200).json(result)})
    .catch(err => {res.status(500).json({error: err,
    message: "data not available"})});
});

route.delete('/:orderId', (req, res, next) => {
   console.log('xdxs', req.params.orderId);
    const id = req.params.orderId;
        Order.findOneAndRemove({ _id: id })
    .exec()
    .then(result =>{
        res.status(200).json({
            result: result,
            message: 'deleted success'
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    });
});

route.get('/:orderId', (req, res, next) => {
    Order.findById(req.params.orderId)
         .exec()
         .then(order => {
             res.status(200).json({
                order: order,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/orders/'
                }
             })
         })
         .catch(err => {
             res.status(500).json({
                 error: err
             });
         })
});

module.exports = route;