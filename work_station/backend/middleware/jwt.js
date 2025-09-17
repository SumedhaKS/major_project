const {jwt} = require('../config');

//all JWT functins are working->tested
const signToken = (payload,options={})=>{
    return jwt.sign(payload,process.env.JWT_SECRET,{
    expiresIn: process.env.JWT_EXPIRES_IN || "30m",
    ...options,
  });
}

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {signToken , verifyToken};