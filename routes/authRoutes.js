const express = require("express")
const router = express.Router();
const {userRegistration, activeTrue} = require("../controllers/authController");
const {userById} = require("../middlewares/auth-middleware")

// Public Routes
router.post("/register", userRegistration);

router.get('/profile/:token', activeTrue);
router.param('token', userById)


module.exports = router
