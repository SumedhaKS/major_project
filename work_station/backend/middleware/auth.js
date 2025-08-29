// auth middleware
const {verifyToken} = require('./jwt');

//function is working -> tested
module.exports = function authMiddleware(req, res, next) {
    try{
        const headder = req.headers.authorization || "";
        const [schema , token] = headder.split(" ");
        if(schema != "Bearer" || !token){
            res.json({"message":"token not found or invalid token"}).status(401);
        }
        const decoded = verifyToken(token);
        req.user = decoded;
        return next(); 
    }
    catch(err){
        console.log(`incalid token : error during authorization. Error: ${err}`);
        res.json({"message":"invalid token or expired token"}).status(401);
    }
}