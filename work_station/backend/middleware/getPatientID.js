const prisma = require("../db/client");
// Not tested

async function getPatientID(req,res,next) {
    console.log("Heree: ",req.query.patientId);
    if(!req.query.patientId){
        return res.status(400).json({
            msg : "Invalid request"
        })
    }
    try{
        const patient = await prisma.patient.findUnique({
            where:{
                patientId : req.query.patientId
            }
        })
        if(!patient){
            return res.status(404).json({
                msg : "Invalid patient"
            })
        }
        req.pID = patient.id;
        next() 

    }
    catch(err){
        console.log("Error occurred: ", err)
        return res.status(500).json({
            msg: "Please try again later"
        })
    }
    
}

module.exports = getPatientID