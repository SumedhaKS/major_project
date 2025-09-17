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
                //phone: true,
                patientId:true
            },
            take: 10 // Limit the number of suggestions
        });
        res.json({
            "suggestions": suggestions
        }).status(200)
    }catch(err){
        res.json({"Error":err}).status(500);
    }
    
})


router.post('/register', authMiddleware, async (req, res) => {
    const { name, age, gender, phone, address } = req.body;

    if (!name || !age || !gender || !phone || !address) {
        return res.status(400).json({
            message: "Insufficient data, please fill in all the fields and try again"
        })
    }

    try {
        const patientExists = await Client.patient.findMany({
            where: { phone ,name},
            select: { id: true, name: true, phone: true }
        });

        if (patientExists.length > 0) {
            return res.status(201).json({
                message: `Patient with phone ${phone} already exists`
            });
        }

        const tempPatient = await Client.patient.create({
            data: {
                patientId: "TEMP",
                name,
                age: Number(age),
                gender,
                phone,
                address
            }
        });

        if (!tempPatient) {
            return res.status(500).json({
                message: "Failed to register the patient"
            });
        }

        const patientID = `PT${String(tempPatient.id).padStart(6, '0')}`;
        console.log(`Generated patient ID: ${patientID}`);

        const updatePID = await Client.patient.update({
            where: { id: tempPatient.id },
            data: { patientId: patientID }
        });

        return res.status(200).json({
            message: "Patient registered successfully",
            patient: updatePID
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
});


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