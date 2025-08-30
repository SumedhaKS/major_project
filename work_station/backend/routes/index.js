const express = require("express");
const router = express.Router();
const userRouter = require("./user.js")
const modelRouter = require("./model.js")

router.use('/user', userRouter);
router.use('/model', modelRouter)


module.exports = router;
