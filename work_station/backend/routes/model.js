const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");
const getPatientID = require("../middleware/getPatientID");
const generateXrayID = require("../middleware/generateXrayId");
const uploadWithRollback = require("../middleware/multer");

const prisma = require("../db/client");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data")

router.get('/', (req, res) => {
    res.json({
        msg: "Model router healthy"
    })
})

/* 
req body {
    patientID ,
    token ,
    image
}
*/

/*
    => * images/uploads and images/analyzed can have duplicate images. ie, redundant images. 
    TODO: hash images and store hash value, compare hash on req
           - if found use available image
           - else upload to storage and normal flow 
*/

router.post("/predict", authMiddleware, getPatientID, generateXrayID, uploadWithRollback, async (req, res) => {

    console.log(req.file);
    console.log(req.xID);
    try {
        //  if (req.existingXRay) and (req.analyzedPath) - no filepath update return the image at analyzed path
        if (req.existingXRay ) { 
            if(req.analyzedPath != null){
                console.log("inside here in model.js")
                return res.sendFile(req.analyzedPath);
            }
            //  xray exists but not ananlyzed => then send to model            
        }
        else{
            await prisma.xRay.update({
                where: { xrayId: req.xID },
                data: {
                    filePath: req.filePath
                }
            })
            
        }
       
    
        const form = new FormData()
        form.append("file", fs.createReadStream(req.filePath))

        const modelResponse = await axios.post("http://localhost:8000/analyze", form, {
            headers: form.getHeaders(),                             // Returns a shallow copy of the current outgoing headers
            responseType: "arraybuffer"
        });

        if (!modelResponse) {
            return res.status(500).json({
                msg: "Failed to analyze"
            })
        }

        const analyzedFilename = `${req.xID}-analyzed.png`;
        const getAnalyzedDir = path.resolve("public/images/analyzed");
        const analyzedPath = path.join(getAnalyzedDir, analyzedFilename);

        await fs.promises.writeFile(analyzedPath, modelResponse.data);

        await prisma.xRay.update({
            where: { xrayId: req.xID },
            data: {
                analyzedPath: analyzedPath
            }
        })

        return res.sendFile(analyzedPath);

    } catch (err) {
        console.error("Error occurred: ", err);
        return res.status(500).json({
            msg: "Prediction failed"
        })
    }

})

module.exports = router;