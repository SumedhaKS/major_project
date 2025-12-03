const { zod } = require("../config");

const adminAuthSchema = zod.object({
    username: zod.string(),
    password: zod.string() 
})

module.exports = function adminAuthMiddleware(req, res, next) {
    try{
        const { username, password } = req.body;
        
    }
    catch(err){
        console.error(`Error during admin authorization : ${err}`);
        res.json({
            "message":"invalid token or expired token"
        }).status(401);
    }
}
