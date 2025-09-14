const express = require('express')
const router = express.Router();

const Client = require('../db/client');    // instantiate client once in /db/client.js and re-use it 

const  authMiddleware  = require("../middleware/auth");

//Fetch patient by id -> POST (for the drop down bar) [to check if patient exists]
router.get('/data/:phn',authMiddleware, (req,res)=>{
    console.log("here");
    res.json({
        msg: "working"
    }).status(200)
})


//register a new patient 
router.post('/register',authMiddleware, (req,res)=>{
    console.log("here");
    res.json({
        msg: req.params.id
    })
})

//pending route
router.put('/update/:id',authMiddleware,(req,res)=>{
    res.json({
        msg: req.params.id
    })
});

module.exports = router;