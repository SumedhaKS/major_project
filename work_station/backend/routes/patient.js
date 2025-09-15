const express = require('express')
const router = express.Router();

const Client = require('../db/client');    // instantiate client once in /db/client.js and re-use it 

const  authMiddleware  = require("../middleware/auth");

//Fetch patient by id -> POST (for the drop down bar) [to check if patient exists]

router.get('/search',authMiddleware, async (req,res)=>{
    try{
        const query = req.query.phno;
        if(!query){
            res.send(200).json({suggestions:[]})
        }
        // int the frontend while fetching from this api the query name should match this(phno)
        // ->/api/search?phno=data
        const suggestions = await Client.patient.findMany({
            where: {
                phone: {
                    contains: query
                }
            },
            select: {
                name:true,
                phone: true
            },
            take: 10 // Limit the number of suggestions
        });
        res.json({
            "suggestions": suggestions
        }).status(200)
    }catch(err){
        res.json({"Error":err}).status(500);
    }
    



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

router.get('/getusers',authMiddleware,async (req,res)=>{
    const result = await Client.patient.findMany();
    res.json({"data":result});
})

module.exports = router;