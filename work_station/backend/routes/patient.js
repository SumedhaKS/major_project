const express = require('express')
const router = express.Router();

const Client = require('../db/client');    // instantiate client once in /db/client.js and re-use it 

const  authMiddleware  = require("../middleware/auth");

const path = require('path');


const fs = require("fs");


// Reports page route - Get all X-rays with pagination and filters
// Query params: page (default 1), limit (default 10), patientId, patientName, xrayId, hasAnalyzed, startDate, endDate
router.get('/report', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const where = {};

    // Filter by patient ID
    if (req.query.patientId) {
      const patient = await Client.patient.findUnique({
        where: { patientId: req.query.patientId }
      });
      if (patient) {
        where.patientId = patient.id;
      } else {
        // If patient not found, return empty results
        return res.status(200).json({
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0
          }
        });
      }
    }

    // Filter by patient name (search in patient name)
    if (req.query.patientName) {
      const patients = await Client.patient.findMany({
        where: {
          name: {
            contains: req.query.patientName,
            mode: 'insensitive'
          }
        }
      });
      if (patients.length > 0) {
        where.patientId = {
          in: patients.map(p => p.id)
        };
      } else {
        // If no patients found, return empty results
        return res.status(200).json({
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0
          }
        });
      }
    }

    // Filter by X-ray ID
    if (req.query.xrayId) {
      where.xrayId = {
        contains: req.query.xrayId,
        mode: 'insensitive'
      };
    }

    // Filter by has analyzed file
    if (req.query.hasAnalyzed === 'true') {
      where.analyzedPath = { not: null };
    } else if (req.query.hasAnalyzed === 'false') {
      where.analyzedPath = null;
    }

    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      where.createdAt = {};
      if (req.query.startDate) {
        where.createdAt.gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        where.createdAt.lte = new Date(req.query.endDate);
      }
    }

    // Get total count for pagination
    const total = await Client.xRay.count({ where });

    // Fetch reports with patient information
    const reports = await Client.xRay.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        patient: {
          select: {
            patientId: true,
            name: true
          }
        }
      }
    });

    // Format response
    const formattedReports = reports.map(xray => ({
      xrayId: xray.xrayId,
      patientId: xray.patient.patientId,
      patientName: xray.patient.name,
      createdAt: xray.createdAt.toISOString(),
      hasAnalyzedFile: xray.analyzedPath ? true : false
    }));

    res.status(200).json({
      data: formattedReports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ message: "Error fetching reports" });
  }
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


// GET /api/v1/patient/:xrayId/xrayImg - Streams the xray image as base64
//router.get("/:xrayId/xrayImg", authMiddleware, async (req,res)=>{
router.get("/:xrayId/xrayImg", authMiddleware, async (req,res)=>{
    console.log("at get xray from xrayID route")
    const xrayId = req.params.xrayId;
    console.log(xrayId)
    
    if(!xrayId){
        return res.status(400).json({message: "xrayId is required"});
    }
    
    try {
        const xray = await Client.xRay.findUnique({
            where: { xrayId: xrayId }
        });
        
        if(!xray){
            return res.status(404).json({message: "X-ray not found"});
        }

        // Stream the image like in Allxrays route
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

            res.status(200).json({
                xrayId: xray.xrayId,
                name: xray.name,
                patientId: xray.patientId,
                createdAt: xray.createdAt.toISOString(),
                file: `data:image/jpeg;base64,${base64Image}`,
                analyzedFile: analyzedBase64
                    ? `data:image/jpeg;base64,${analyzedBase64}`
                    : null,
            });

        } catch (fileErr) {
            console.error("Error reading file:", fileErr);
            return res.status(500).json({message: "Error reading X-ray file"});
        }
        
    }catch(err){
        console.error(err);
        res.status(500).json({message: "Error fetching X-ray"});
    }
})


// CHANGE THIS ROUTE -> ADD A DFFERENT ROUTE TO SERVE THE XRAYS . THIS ROUTE SHOULD RETURN ONLY METADATA OF THE XRAYS AND NOT THE IMAGES THEMSELVES.
//patientView page route -> only metadata returned 
//Fetch all xrays for a patient at patientView page when loaded 

// PatientView page route - Returns only X-ray metadata (no images)
// Fetch all xray metadata for a patient at patientView page when loaded 
router.get("/:patientId/Allxrays", authMiddleware, async (req, res) => {
  const { patientId } = req.params;

  try {
    const patient = await Client.patient.findUnique({
      where: { patientId },
      include: { xRays: true },
    });

    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const xrayData = patient.xRays.map((xray) => {
      return {
        xrayId: xray.xrayId,
        name: xray.name,
        patientId: xray.patientId,
        createdAt: xray.createdAt.toISOString(),
        hasAnalyzedFile: xray.analyzedPath ? true : false,
      };
    });

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