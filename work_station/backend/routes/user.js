const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth")

router.get('/', authMiddleware, (req,res)=>{            // should have auth middleware
    const {search} = req.query;
    res.json({
        msg: search
    })
    // res.json({
    //     msg: "User router healthy"
    // })
})

router.post('/signup', (req,res)=>{
    // jwt.sign should be with userId (unique id)
    

})

router.post('/signin', (req,res)=>{

})

router.post('/:id', (req,res)=>{
    console.log("here");
    res.json({
        msg: req.query.id
    })
})



module.exports = router