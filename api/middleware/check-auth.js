const jwt = require('jsonwebtoken');
const JWT_KEY = 'secrate';
// console.log('111111111111111');
module.exports = (req, res, next) => {
// console.log('2222222222222222222');
  
    try {
        console.log('req.headers.authorization', req.headers.authorization);
  
        const token = req.headers.authorization.split(" ")[1];
        // const decoded = jwt.verify(req.body.token, JWT_KEY);
console.log('token', token);

        const decoded = jwt.verify(token, JWT_KEY);
        req.userData = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            messsge: 'Auth failed'
        });
    }
};