const express = require("express");
const router = express.Router();
const userRouter = require("./user.js")
const modelRouter = require("./model.js")
const patientRouter = require("./patient.js")

router.use('/user', userRouter);
router.use('/model', modelRouter)
router.use('/patient',patientRouter);

module.exports = router;
