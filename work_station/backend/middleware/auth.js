const { jwt } = require("../config"); 
require('dotenv').config();


function authMiddleware(req, res, next) {
    console.log("entered");
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer')) {
        console.log("not proper token")
        return res.status(403).json({});
    }
    const token = header.split(' ')[1];
    try {
        console.log("entered try");
        const userVerification = jwt.verify(token, process.env.JWT_SECRET);
        console.log(userVerification);
        req.userId = userVerification.userId;
        next()

    }
    catch (err) {
        console.error(err);
        return res.status(403).json({});
    }
    
}

module.exports = {
    authMiddleware
}
