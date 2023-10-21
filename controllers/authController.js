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

const userLogin = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      if (email && password) {
        const user = await UserModel.findOne({ email: email }).populate(
          "role",
          "name"
        );
        if (user != null) {
          const isMatch = await bcrypt.compare(password, user.password);
          if (isMatch && email == user.email && user.active == true) {
            // generate token
            const token = jwt.sign(
              { userID: user._id, name: user.name, role: user.role.name },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "5d" }
            );
  
            res.cookie("authToken", token, { httpOnly: true });
  
            switch (user.role.name) {
              case "manager":
                return res.redirect("/api/user/manager/me");
              case "delivery":
                return res.redirect("/api/user/delivery/me");
              case "client":
                return res.redirect("/api/user/client/me");
            }
  
            res.status(200).send({
              status: "success",
              message: "Login success",
              token: token,
            });
          } else {
            res.status(401).send({
              status: "failed",
              message: "Email or password not valid or you don't activate your account",
            });
          }
        } else {
          res
            .status(404)
            .send({ status: "failed", message: "This account doesn't exist" });
        }
      } else {
        res
          .status(400)
          .send({ status: "failed", message: "All fields are required" });
      }
    } catch (error) {
      res.status(401).send({ status: "failed", message: "Unable to login" });
      console.log(error);
    }
};

const changePassword = async (req, res) => {
    const { password, password_confirmation } = req.body;
    if (password && password_confirmation) {
      if (password !== password_confirmation) {
        res.status(400).send({
          status: "failed",
          message: "New password and confirm password doesn't match",
        });
      } else {
        const salt = await bcrypt.genSalt(10);
        const newHashPassword = await bcrypt.hash(password, salt);
        // await UserModel.findByIdAndUpdate(req.user._id, {$set: {password: newHashPassword}});
        await UserModel.findByIdAndUpdate(req.user._id, {
          $set: { password: newHashPassword },
        });
  
        res.status(200).send({
          status: "success",
          message: "New password changed succefully",
        });
      }
    } else {
      res
        .status(400)
        .send({ status: "failed", message: "All field are required" });
    }
};

const loggedUser = (req, res) => {
    res.send({ User: req.user });
};


module.exports = {userRegistration, activeTrue, userLogin, changePassword, loggedUser}

