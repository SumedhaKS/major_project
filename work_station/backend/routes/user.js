const express = require('express')
require('dotenv').config();
const bcrypt = require('bcrypt');
const { zod } = require("../config")
const router = express.Router();

const saltrounds = 10;
const { signToken } = require('../middleware/jwt')
const prisma = require("../db/client")   // instantiate client once in /db/client.js and re-use it 

const userSchema = zod.object({             // can be more strict
    username: zod.email(),
    password: zod.string().min(4),
    role: zod.string()                      // role to be made optional ?
})

router.post('/signup', async (req, res) => {
    try {
        const validateUser = userSchema.safeParse(req.body);
        // the role has to be either doc or staff -> else the DB will throw an error  -> not really I guess as @default(staff) is mentioned in schema
        if (!validateUser.success) {
            return res.status(400).json({ "message": "invalid username or password or role" });
        }

        const { username, password, role } = validateUser.data;
        console.log(username, password, role )

        const hashed_pwd = await bcrypt.hash(password, saltrounds);

        await prisma.user.create({
            data: {
                username,
                password: hashed_pwd,
                role
            },
        });
        res.status(200).json({
            "message": "new user created",
        });

    }
    catch (error) {
        // error handling for already username taken (username is a unique attribute in DB)
        if (error.code === 'P2002' && error.meta?.target?.includes('username')) {
            res.status(409).json({ message: "Username already exists" });
        }
        // error handling for ivalid role
        else if (error.message.includes("Invalid value for argument `role`")) {
            return res.status(400).json({ error: "Invalid role value" });
        }
        else {
            res.status(500).json({ message: "Internal server error" });
        }
        // console.log(error);
    }

});

const signinSchema = zod.object({
    username: zod.email(),
    password: zod.string().min(4),
    role: zod.string()
})

//staff login
router.post('/signin', async (req, res) => {
    try {
        console.log(req.body);

        const validateUser = signinSchema.safeParse(req.body);
        if (!validateUser.success) {
            return res.status(400).json({ "message": "Invalid inputs" });
        }

        const { username, password, role } = req.body;

        const creds = await prisma.user.findFirst({
            where: {
                username,
                role
            }
        });
        if (!creds) {
            return res.status(404).json({ message: "user not found" });
        }

        const match = await bcrypt.compare(password, creds.password);
        if (!match) {
            return res.status(401).json({ message: "incorrect password" });
        }

        const token = signToken({ username: creds.username });
        return res.status(200).json({
            message: "login successful",
            token: token
        });

    }
    catch (err) {
        console.log(`an error occurred. Error: ${err}`);
        return res.status(500).json({ msg: "internal server error" });
    }
});

router.post("/verifyAdmin", (req,res)=>{
    const password = req.body.password;

    const valid = password === process.env.ADMIN_PASSWORD;

    if(!valid){
        return res.json({
            valid
        })
    }

    return res.json({
        valid
    })
})

module.exports = router;
