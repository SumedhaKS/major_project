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
        if (req.existingXRay) {
            if (req.analyzedPath != null) {
                console.log("inside here in model.js")
                return res.sendFile(req.analyzedPath);
            }
            //  xray exists but not ananlyzed => then send to model            
        }
        else {
            await prisma.xRay.update({
                where: { xrayId: req.xID },
                data: {
                    filePath: req.filePath
                }
            })

        }

        console.log(req.query.modelType)
        const requestedModelType = req.query.modelType;      // "float64" || "float16" || "int8"
        for(let i =0 ; i<20 ; i++){
        const form = new FormData()
        form.append("file", fs.createReadStream(req.filePath))
        form.append("modelType", requestedModelType)

        let startTime = new Date().getTime();
        
        const modelResponse = await axios.post("http://192.168.1.113:8000/analyze", form, {
            headers: form.getHeaders(),                             // Returns a shallow copy of the current outgoing headers
            responseType: "arraybuffer"
        });
        if (!modelResponse) {
            console.log(`no response at i :${i}`)
        }
        console.log(`done iteration i:${i}`)
        let endTime = new Date().getTime();

        console.log(`${endTime-startTime}\n`);
    }
        

        // if (!modelResponse) {
        //     return res.status(500).json({
        //         msg: "Failed to analyze"
        //     })
        // }

        // const analyzedFilename = `${req.xID}-analyzed.png`;
        // const getAnalyzedDir = path.resolve("public/images/analyzed");
        // const analyzedPath = path.join(getAnalyzedDir, analyzedFilename);

        // await fs.promises.writeFile(analyzedPath, modelResponse.data);

        // await prisma.xRay.update({
        //     where: { xrayId: req.xID },
        //     data: {
        //         analyzedPath: analyzedPath
        //     }
        // })

        // return res.sendFile(analyzedPath);

    } catch (err) {
        console.error("Error occurred: ", err);
        return res.status(500).json({
            msg: "Prediction failed"
        })
    }

})

module.exports = router;