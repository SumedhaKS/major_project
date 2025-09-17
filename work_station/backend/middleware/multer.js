const multer = require("multer");
const path = require("path");
const prisma = require("../db/client");
const crypto = require("crypto");
const fs = require("fs");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "..", "public", "images", "uploads"));
    },
    filename: (req, file, cb) => {
        const fileName = req.xID + path.extname(file.originalname);   //generate  unique filename using XrayID
        cb(null, fileName);
    }
})

const upload = multer({ storage });

function uploadWithRollback(req, res, next) {
    const singleUpload = upload.single("image");        //upload.single() or array() and "" should match FE's field name

    singleUpload(req, res, async (err) => {
        if (err) {
            console.error("Multer error: ", err);
            if (req.xID) {
                try {
                    await prisma.xRay.delete({
                        where: { xrayId: req.xID }
                    });
                    console.log("Rolled back Xray entry with id:", req.xID);
                } catch (dbErr) {
                    console.error("Rollback failed: ", dbErr);
                }
            }
            return res.status(400).json({
                msg: "Upload failed"
            });
        }

        try {
            if(!req.file){
                await prisma.xRay.delete({
                    where: {xrayId: req.xID}
                })
                return res.status(400).json({
                    msg: "No file recieved"
                })
            }
            const fileBuff = fs.readFileSync(req.file.path);

            const hash = crypto.createHash("sha256").update(fileBuff).digest("hex");

            const existingXray = await prisma.xRay.findFirst({
                where: { fileHash: hash }
            })

            if (existingXray) {

                fs.unlinkSync(req.file.path);
                // delete new xray record
                await prisma.xRay.delete({
                    where: { xrayId: req.xID }
                })
                // if we already have the xray and it has been analyzed, then no need to proceed further right? - yes
            
                if(existingXray.analyzedPath != null){
                    console.log("inside here in multer")
                    req.existingXRay = true;
                    req.analyzedPath = path.resolve("public", existingXray.analyzedPath);
                    return next()
                }

                console.log("Duplicate image detected, using existing record")

                // add existing Xray's ID onto req
                req.xID = existingXray.xrayId;
                req.existingXRay = true;
                req.filePath = existingXray.filePath;

                return next()
            }
            else {
                await prisma.xRay.update({
                    where: { xrayId: req.xID },
                    data: { fileHash: hash }
                })
                req.existingXRay = false;
                req.filePath = req.file.path;

                next()
            }
        }
        catch (hashErr) {
            console.error("Hashing error: ", hashErr);
            return res.status(500).json({
                msg: "File processing failed"
            })
        }
    });
}

module.exports = uploadWithRollback;

