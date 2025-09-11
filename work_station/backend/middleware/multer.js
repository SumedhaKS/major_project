const multer = require("multer");
const path = require("path");

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

module.exports = upload;

