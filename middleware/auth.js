const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config();

const MY_TOKEN_PW = process.env.TOKEN_PW;

module.exports = (req, res, next) => {
   try {
       const token = req.headers.authorization.split(' ')[1];
       const decodedToken = jwt.verify(token, MY_TOKEN_PW);
       const userId = decodedToken.userId;
       req.auth = {
           userId: userId
       };
	next();
   } catch(error) {
       res.status(401).json({ error });
   }
};