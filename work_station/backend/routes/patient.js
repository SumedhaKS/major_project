const express = require('express')
const router = express.Router();

const Client = require('../db/client');    // instantiate client once in /db/client.js and re-use it 

const  authMiddleware  = require("../middleware/auth");

const path = require('path');


const fs = require("fs");


// not used anywhere
// /report -> get all reports paginated (10 reports per page)
router.get('/report:pageNumber',authMiddleware,async (req,res)=>{
  const { pageNumber } = req.params;
  const page = pageNumber ? parseInt(pageNumber, 10) : 1;
  const reports = await Client.xRay.findMany({
    skip: (page - 1) * 10,
    take: 10,
    orderBy: {
      createdAt: 'desc'
    }
  });
  res.json({"data":reports}).status(200);
});
  

//not used anywhere
router.get('/report/xray/:xrayId',authMiddleware,async (req,res)=>{
    const xrayID = req.params.xrayId;
    if(!xrayID){res.json({message:"invalid request"})}
    try{
        const xray = await Client.xRay.findUnique({
            where: { xrayId: xrayID }
        });
        if(!xray){res.json({message:"xray not found"})}
        res.json({data:xray}).status(200);
    }catch(err){res.json({message:"error fetching xray"}).status(500);}
})


// GET /api/v1/patient/:patientId/xrays/metadata
router.get("/:xrayId/xrayImg", authMiddleware,(req,res)=>{
    const xrayID = req.params.xrayId
    
})




// CHANGE THIS ROUTE -> ADD A DFFERENT ROUTE TO SERVE THE XRAYS . THIS ROUTE SHOULD RETURN ONLY METADATA OF THE XRAYS AND NOT THE IMAGES THEMSELVES.
//patientView page route
//Fetch all xrays for a patient at patientView page when loaded 
router.get("/:patientId/Allxrays", authMiddleware, async (req, res) => {
  const { patientId } = req.params;

  try {
    const patient = await Client.patient.findUnique({
      where: { patientId },
      include: { xRays: true },
    });

    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const xrayData = patient.xRays.map((xray) => {
      try {
        const filePath = path.resolve(xray.filePath);
        const fileBuffer = fs.readFileSync(filePath);
        const base64Image = fileBuffer.toString("base64");

        let analyzedBase64 = null;
        if (xray.analyzedPath) {
          const analyzedPath = path.resolve(xray.analyzedPath);
          if (fs.existsSync(analyzedPath)) {
            const analyzedBuffer = fs.readFileSync(analyzedPath);
            analyzedBase64 = analyzedBuffer.toString("base64");
          }
        }

        return {
          xrayId: xray.xrayId,
          name: xray.name,
          patientId: xray.patientId,
          createdAt: xray.createdAt.toISOString() ,
          file: `data:image/jpeg;base64,${base64Image}`,
          analyzedFile: analyzedBase64
            ? `data:image/jpeg;base64,${analyzedBase64}`
            : null,
        };
      } catch (err) {
        console.error("Error reading file:", err);
        return null;
      }
    }).filter(Boolean);

    res.status(200).json({ xRays: xrayData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching X-rays" });
  }
});


//dashboard page route
//Fetch patient by ph -> POST (for the drop down bar) [to check if patient exists]
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

//dashboard and patient-details page route 
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