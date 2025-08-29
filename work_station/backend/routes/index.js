const express = require("express");
const router = express.Router();
const userRouter = require("./user.js")
const modelRouter = require("./model.js")
const login_register = require('./login_register.js');



router.use('/user', userRouter);
router.use('/model', modelRouter);
router.use('/', login_register)

module.exports = router;