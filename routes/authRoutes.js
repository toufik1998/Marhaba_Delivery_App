const express = require("express")
const router = express.Router();
const {userRegistration, activeTrue, userLogin} = require("../controllers/authController");
const {userById} = require("../middlewares/auth-middleware")

// Public Routes
router.post("/register", userRegistration);
router.post("/login", userLogin)

router.get('/profile/:token', activeTrue);
router.param('token', userById)


module.exports = router
