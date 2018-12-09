const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const productRoute = require('./api/routes/products');
const orderRoute = require('./api/routes/orders');
const userRoute = require('./api/routes/users');

mongoose.connect(
    "mongodb://node-shop:" + "node-shop" +  "@node-rest-shop-shard-00-00-703un.mongodb.net:27017,node-rest-shop-shard-00-01-703un.mongodb.net:27017,node-rest-shop-shard-00-02-703un.mongodb.net:27017/test?ssl=true&replicaSet=node-rest-shop-shard-0&authSource=admin&retryWrites=true"
    ).then(() => { // if all is ok we will be here
        // return server.start();
    })
    .catch(err => { // we will not be here...
        console.error('App starting error:', err.stack);
        process.exit(1);
    });

app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
// app.use(bodyParser.urlencoded({extended: false}));
// app.use(bodyParser.json());
console.log('server call');

app.use((req, res, next) => {

res.header("Access-Control-Allow-Origin", "*");
res.header(
    "Access-Controll-Allow-Headers",
    "Origin, X-Request-Width, Content-Type, Accept,, Authorization"
);
if(req.method === 'OPTION') {
    res.header("Access-Controll-Allow-Method", "PUT", "POST", "DELETE", "GET");
   return res.status(200).json({});
}
next();
});
// Route which shoud handle request
app.use('/products', productRoute);
app.use('/orders', orderRoute);
app.use('/users', userRoute);

app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
});

module.exports = app;
