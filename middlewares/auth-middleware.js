const UserModel = require("../models/User");
const jwt = require('jsonwebtoken');


const userById = (req, res, next) => {
    let token = req.params.token;
    console.log(token);
    // Verify and decode the token
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        // Handle token verification error
        return res.status(401).json({ error: "Token verification failed" });
      }
  
      // Use the decoded object to get the user's ID
      const userId = decoded.userID;
      console.log(decoded);
  
  
      UserModel.findById(userId)
        .exec()
        .then((user) => {
          if (!user) {
            return res.status(404).json({ error: "User not found" });
          }
          req.profile = user;
          next();
        })
        .catch((err) => {
          return res.status(500).json({ error: "Internal server error" });
        });
    });
};


module.exports = {userById}