const express = require('express')
require('dotenv').config();
const bcrypt = require('bcrypt')
const router = express.Router();

const saltrounds = 10;
const {signToken} = require('../middleware/jwt')
const { PrismaClient } = require('../db/generated/prisma/client');    // instantiate client once in /db/client.js and re-use it 

const { authMiddleware } = require("../middleware/auth")


router.get('/', authMiddleware, (req,res)=>{            // should have auth middleware
    const {search} = req.query;
    res.json({
        msg: search
    })
    // res.json({
    //     msg: "User router healthy"
    // })
})

router.post('/signup', (req,res)=>{
    // jwt.sign should be with userId (unique id)
    

})

router.post('/signin', (req,res)=>{

})

router.post('/:id', (req,res)=>{
    console.log("here");
    res.json({
        msg: req.query.id
    })
})

router.post('/register' , async (req,res)=>{
    try{
        const { userName, password, role } = req.body;
        // role.trim()                  remove any white spaces   -> *Not required if we use options in FE 
        if(!userName || !password || !role)        // the role has to be either doc or staff -> else the DB will throw an error     -> not really I guess as @default(staff) is mentioned in schema
            return res.status(400).json({"message":"invalid username or password or role"});
        //generate a random salt 
        const salt = await bcrypt.genSalt(saltrounds);
        //hash the password
        const hashed_pwd =await bcrypt.hash(password,salt);
        //create a new data entry in DB 
        const register = await prisma.users.create({
            data:{
                username : userName,
                password : hashed_pwd,
                role
            },
        });   
        res.status(200).json({
            "message":"new user created",
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
        console.log(error);
    }
    
});


//login user
/*
1. check if username exists 
2. if !exists then send him to register page 
3. if exists then compare the pwds - bcrypt.compare()
4. if pwd !match error else send a JWT 
5. further redirect or other logic  
*/ 

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const creds = await prisma.users.findUnique({
            where: { username: username }
        });
        if (!creds) {
            return res.status(404).json({ message: "user not found" });
        }
        const match = await bcrypt.compare(password, creds.password);
        if (!match) {
            return res.status(401).json({ message: "incorrect password" });
        }
        const token = signToken({ username: creds.username });
        return res.status(200).json({ message: "login successful", "data": {token} });
    } catch (err) {
        console.log(`an error occurred. Error: ${err}`);
        return res.status(500).json({ msg: "internal server error" });
    }
});


module.exports = router
