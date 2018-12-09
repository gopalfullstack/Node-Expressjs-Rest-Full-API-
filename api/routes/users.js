const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const nodemailer = require('nodemailer'); 
router.post('/signUp', (req, res, next) => {
    console.log('req.body', req.body);

    User.find({
            email: req.body.email
        })
        .exec()
        .then(user1 => {
            if (user1.length >= 1) {
                res.status(409).json({
                    message: 'mail exists already',
                        email: user1.email
                })
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err,
                        });
                    } else {

                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash
                        });
                        console.log('user', user);
                        user.save()
                            .then(result => {
                                res.status(200).json({
                                    data: result,
                                    message: 'user created successfully'
                                })
                            })
                            .catch(err => {
                                res.status(500).json({
                                    message: 'database error',
                                    error: err
                                });
                            });

                    }
                    // Store hash in your password DB.
                })
            }
        });

    router.delete('/:userId', (req, res, next) => {
        const id = req.params.userId;
        User.findOneAndRemove({
                _id: id
            })
            .exec()
            .then(result => {
                res.status(200).json({
                    result: result,
                    message: 'User deleted successfully'
                });
            })
            .catch(err => {
                res.status(500).json({
                    error: err
                })
            });
    });



    router.post('/signIn', (req, res, next) => {
        
        // console.log('req.body.email', req.body.email);

        
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'gopal.meanstack@gmail.com',
              pass: '8964044685'
            }
          });
          
          var mailOptions = {
            from: 'gopalmeena786@gmail.com',
            to: 'gopalmeena.hr@gmail.com',
            subject: 'Sending Email using Node.js',
            text: 'That was easy! gopal meena'
          };

          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });



        User.find({
                email: req.body.email
            })
            .exec()
            .then(user => {
                // console.log('user', user);
                
                if (user.length < 1) {
                    return res.status(401).json({
                        message: 'Auth failed'
                    });
                }
                bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                    if (err) {
                        return res.status(401).json({
                            message: 'Auth failed'
                        });
                    }
                    if (result) {
                        const JWT_KEY = 'secrate';
                        const token = jwt.sign(
                            {
                                email: user[0].email,
                                userId: user[0]._id
                            },
                            JWT_KEY,
                            {
                                expiresIn: '1h'
                            });

                        return res.status(200).json({
                            message: 'Auth successful',
                            token: token
                        });
                    }

                    return res.status(401).json({
                        message: 'Auth failed'
                    });

                });
            })
            .catch(err => {
                res.status(500).json({
                    error: err
                })
            });
    });

});


module.exports = router;