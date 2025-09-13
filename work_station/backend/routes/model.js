const express = require("express");
const router = express.Router();
const axios = require("axios");
const authMiddleware = require("../middleware/auth");
const prisma = require("../db/client");
const getPatientID = require("../middleware/getPatientID");
const generateXrayID = require("../middleware/generateXrayId");
const uploadWithRollback = require("../middleware/multer");

router.get('/', (req, res) => {
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


router.post("/predict", authMiddleware, getPatientID, generateXrayID, uploadWithRollback, async (req, res) => {
    // Note: Update XrayID and filepath in DB with actual values
    // req.xID => xrayId   &&   req.file.path => filepath (maybe)
    console.log(req.file);
    console.log(req.xID);
    await prisma.xRay.update({
        where: { xrayId: req.xID },
        data: {
            filePath: `/images/uploads/${req.file.filename}`
        }
    })
    return res.json({
        msg: "All middlewares passed"
    })


})

module.exports = router;