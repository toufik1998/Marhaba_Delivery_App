const UserModel = require("../models/User");
const RoleModel = require("../models/Role")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs")
const transporter = require("../config/emailConfig")

const userRegistration = async (req, res) => {
    const {name, email, password, password_confirmation ,phone, address, role} = req.body;

    const user = await UserModel.findOne({email: email})

    if(user){
        res.status(409).send({"status": "failed", message: "Sorry Email already exist"})
    }else{
        if(name && email && password && password_confirmation && phone && address && role){
            if(password == password_confirmation){
                try {
                    const salt = await bcrypt.genSalt(10);
                    const hashPassword = bcrypt.hash(password, salt);

                    const doc = new UserModel({
                        name: name,
                        email: email,
                        password: hashPassword,
                        phone: phone,
                        address: address,
                        role: role
                    })

                    await doc.save();

                    const saved_user = UserModel.findOne({email: email}).populate("role", "name");

                    // generate token
                    const token = jwt.sign({ userID: saved_user._id,
                            name: saved_user.name,
                            email: saved_user.email,
                            role: saved_user.role
                        }, 
                        process.env.JWT_SECRET_KEY,
                        {expiresIn: "5d"}
                    )

                    const link = `http://127.0.0.1:4444/api/auth/profile/${token}`;
                    
                    let info = await transporter.sendMail({
                        from: process.env.EMAIL_FROM,
                        to: saved_user.email,
                        subject: "Marhaba Delivery App, Activation Account",
                        html: `<a href=${link}>Please: Click Here To Activate Your Account</a>`
                    })

                    res.status(201).send({status: "success", message: "Registration Succefully: Please check your email to verify your account"});

                } catch (error) {
                    res.status(500).send({"status": "failed", message: "Unable to register"})
                }

            }else{
                res.status(400).send({status: "failed", message: "Password and confirm password doesn't match"});
            }
        }else{
            res.status(400).send({status: "failed", message: "All field are required"});
        }

    }
    
}

const activeTrue = (req, res) => {
    // Update the user's account status to "active"
    UserModel.findByIdAndUpdate(req.profile._id, { active: true })
      .exec()
      .then((updatedUser) => {
        if (!updatedUser) {
          res.status(500).json({ error: "Failed to update user account status" });
        } else {
          res
            .status(200)
            .json({
              message: "Token verified and user account is now active",
              userId: updatedUser._id,
            });
        }
      })
      .catch((updateErr) => {
        res.status(500).json({ error: "Failed to update user account status" });
      });
};


module.exports = {userRegistration, activeTrue}

