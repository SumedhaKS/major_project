// auth middleware
const {verifyToken} = require('./jwt');

//function is working -> tested
module.exports = function authMiddleware(req, res, next) {
    try{
        const header = req.headers.authorization || "";
        const [schema , token] = header.split(" ");
        if(schema != "Bearer" || !token){
            return res.json({
                "message":"token not found or invalid token"
            }).status(401);
        }
        const decoded = verifyToken(token);
        req.user = decoded;
        return next(); 
    }
    catch(err){
        console.error(`invalid token : error during authorization. Error: ${err}`);
        res.json({
            "message":"invalid token or expired token"
        }).status(401);
    }
}
