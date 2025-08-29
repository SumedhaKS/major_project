const express = require('express')
require('dotenv').config();
const bcrypt = require('bcrypt')
const router = express.Router();
const saltrounds = 10;
const { PrismaClient } = require('../db/generated/prisma/client');
const {signToken} = require('../middleware/jwt')
const prisma = new PrismaClient()


router.get('/', (req,res)=>{
    res.json({
        msg: "User router healthy"
    })
})

router.post('/register' , async (req,res)=>{
    try{
        const userName  = req.body.username;
        const password  = req.body.password;
        const role = req.body.role; 
        role.trim() // remove any white spaces 
        if(!userName || !password || !role)// the role has to be either doc or staff -> else the DB will throw an error 
            return res.json({"message":"invalid username or password or role"}).status(400);
        //generate a random salt 
        const salt = await bcrypt.genSalt(saltrounds);
        //hash the password
        const hashed_pwd =await bcrypt.hash(password,salt);
        //create a new data entry in DB 
        const register = await prisma.users.create({
            data:{
                username : userName,
                password : hashed_pwd,
                role : role
            },
        });   
        res.json({
            "message":"new user created",
        }).status(200);
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
        const username = req.body.username;
        const password = req.body.password;
        const creds = await prisma.users.findUnique({
            where: { username: username }
        });
        if (!creds) {
            return res.status(404).json({ "message": "user not found" });
        }
        const match = await bcrypt.compare(password, creds.hashed_password);
        if (!match) {
            return res.status(401).json({ "message": "incorrect password" });
        }
        const token = signToken({ id: creds.id, username: creds.username });
        return res.status(200).json({ "message": "login successful", "data": {token} });
    } catch (err) {
        console.log(`an error occurred. Error: ${err}`);
        return res.status(500).json({ "msg": "internal server error" });
    }
});


module.exports = router