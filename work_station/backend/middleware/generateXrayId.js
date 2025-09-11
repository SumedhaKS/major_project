const prisma = require("../db/client")
// Not tested

async function generateXrayID(req, res, next) {
    // generate Xray ID
    try {                                                       // if(!req.pID) check required ?

        const tempXray = await prisma.xRay.create({             // We don't have xrayId and filepath yet
            data: {
                xrayId: "TEMP",
                patientId: req.pID,
                filePath: "TEMP",
                createdAt: new Date()
            }
        })

        if(!tempXray){
            return res.status(500).json({
                msg: "Please try again later"
            })
        }
        const xrayId = `XR${String(tempXray.id).padStart(6,'0')}`; 
        req.xID = xrayId;                              // added for multer
        next()

    }
    catch(err){
        // console.log("Error occurred: ", err)            
        return res.status(500).json({
            msg: "Please try again later"
        })
    }
   
}


module.exports = generateXrayID