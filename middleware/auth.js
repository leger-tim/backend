const jwt = require('jsonwebtoken');
 
module.exports = (req, res, next) => {
   try {
       const token = req.headers.authorization.split(' ')[1];
       // Mot de passe généré avec Lastpass
       const decodedToken = jwt.verify(token, 'sCp@tvu*&S9xc5ZC0F7I');
       const userId = decodedToken.userId;
       req.auth = {
           userId: userId
       };
	next();
   } catch(error) {
       res.status(401).json({ error });
   }
};