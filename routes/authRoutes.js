const express = require("express")
const router = express.Router();
const {userRegistration, activeTrue, userLogin, changePassword, loggedUser, sendUserResetPasswordEmail, userPasswordReset} = require("../controllers/authController");
const {checkUserAuth ,userById} = require("../middlewares/auth-middleware")

//protected routes middleware level
router.use("/changepassword", checkUserAuth);
router.use("/loggeduser", checkUserAuth);


// Public Routes
router.post("/register", userRegistration);
router.post("/login", userLogin)
router.post("/send-reset-password-email", sendUserResetPasswordEmail)
router.post("/reset-password/:id/:token", userPasswordReset)


router.get('/profile/:token', activeTrue);
router.param('token', userById)


// protected routes
router.post("/changepassword", changePassword)
router.get("/loggeduser", loggedUser)



module.exports = router
