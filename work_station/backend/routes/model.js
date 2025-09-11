const express = require("express");
const router = express.Router();
const axios = require("axios");
const authMiddleware = require("../middleware/auth");
const prisma = require("../db/client");
const upload = require("../middleware/multer");
const getPatientID = require("../middleware/getPatientID");
const generateXrayID = require("../middleware/generateXrayId");

router.get('/', (req,res)=>{
    res.json({
        msg: "Model router healthy"
    })
})

/* 
req 
{
    patientID ,
    token ,
    image
}
*/


router.post("/predict", authMiddleware, getPatientID, generateXrayID, upload.single("image"),  async (req,res)=>{        //upload.single() or array() and "" should match FE's field name
    // Note: Update XrayID and filepath in DB with actual values
    // req.xID => xrayId   &&   req.file.path => filepath (maybe)



})

module.exports = router;