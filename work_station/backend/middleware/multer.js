const multer = require("multer");
const path = require("path");
const prisma = require("../db/client");

const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, path.join(__dirname, "..", "public", "images", "uploads"));    
    },
    filename: (req, file, cb)=>{
        const fileName = req.xID + path.extname(file.originalname);   //generate  unique filename using XrayID
        cb(null, fileName);        
    }
})

const upload = multer({storage});

function uploadWithRollback(req, res, next){
    const singleUpload = upload.single("image");        //upload.single() or array() and "" should match FE's field name

    singleUpload(req, res, async(err)=>{
        if(err){
            console.error("Multer error: ", err);
            if(req.xID){
                try{
                    await prisma.xRay.delete({
                        where: {xrayId: req.xID}
                    });
                    console.log("Rolled back Xray entry with id:", req.xID);
                } catch(dbErr){
                    console.error("Rollback failed: ", dbErr);
                }
            }
            return res.status(400).json({
                msg: "Upload failed"
            });
        }

        next()
    })
} 

module.exports = uploadWithRollback;

