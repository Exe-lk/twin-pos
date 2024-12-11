const {
  saltRounds,
  jwtSecret,
  OTP_EMAIL,
  OTP_PASSWORD,
} = require("../configs/server");
const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const food=require("../models/food");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const jwtDecode = require("jwt-decode");
// in sign in you should send email as username
exports.signIn = async (req, res, next) => {
  try {
    passport.authenticate("local", { session: false }, (err, user, info) => {
      if (err || !user) {
        return res.status(400).json({
          message: info,
        });
      }
      req.login(user, { session: false }, (err) => {
        if (err) {
          res.send(err);
        }
        const body = { _id: user._id, email: user.email };
        const token = jwt.sign({ user: body }, jwtSecret);
        let { password, __v, ...userDetails } = {
          ...user._doc,
        };
        return res.json({
          user: userDetails,
          Authorization: token,
        });
      });
    })(req, res);
  } catch (e) {
    return res.status(400).json({ status: 400, message: e.message });
  }
};

//in signup you should send username, email, password
exports.signUp = async (req, res) => {
  try {
    const { email, password, name, phoneNumber, gender, address } = req.body;

    if (!email || !password) {
      return { message: "Please fill all fields" };
    }

    User.findOne({ email: email }).then((user) => {
      if (user) {
        return res.status(401).json({ message: "User already exists!" });
      }
      bcrypt.hash(password, saltRounds, async function (err, hash) {
        const newUser = new User({
          email: email,
          password: hash,
          name: name,
          phoneNumber: phoneNumber,
          gender: gender,
          address: address,
        });

        const user = await newUser.save();
        if (user) {
          const body = { _id: user._id, email: user.email };
          const token = jwt.sign({ user: body }, jwtSecret);
          let { password, __v, ...userDetails } = {
            ...user._doc,
          };
          return res.status(200).json({
            user: userDetails,
            Authorization: token,
          });
        }
      });
    });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

exports.googleAuth = async (req, res) => {
  try {
    const googleToken = req.body.token;
    const { email, name } = jwtDecode(googleToken);

    const user = await User.findOne({ email: email });
    if (user) {
      const body = { _id: user._id, email: user.email };
      const token = jwt.sign({ user: body }, jwtSecret);
      let { password, __v, ...userDetails } = {
        ...user._doc,
      };
      return res.status(200).json({
        user: userDetails,
        Authorization: token,
      });
    } else {
      const newUser = new User({
        email: email,
        name: name,
      });
      const result = await newUser.save();
      if (result) {
        const body = { _id: result._id, email: result.email };
        const token = jwt.sign({ user: body }, jwtSecret);
        let { password, __v, ...userDetails } = {
          ...result._doc,
        };
        return res.status(200).json({
          user: userDetails,
          Authorization: token,
        });
      }
    }
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }

  const body = { _id: req.user._id, email: req.user.email };
  const token = jwt.sign({ user: body }, jwtSecret);
  return res.status(200).json({ user: req.user, Authorization: token });
};

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists with given email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate OTP code
    const otp = Math.floor(1000 + Math.random() * 9000);

    // Save OTP code to user document
    user.otp = otp;
    await user.save();

    // Send OTP code to user's email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: OTP_EMAIL,
        pass: OTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: OTP_EMAIL,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP code is ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: "Error sending OTP code" });
      } else {
        console.log("Email sent: " + info.response);
        return res
          .status(200)
          .json({ otp: otp, message: "OTP code sent to email" });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { email, otp, pass: newPassword } = req.body;

    // Check if user exists with given email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify OTP code
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP code" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password and remove OTP code
    user.password = hashedPassword;
    user.otp = undefined;
    await user.save();

    // Create and return JWT token
    const body = { _id: user._id, email: user.email };
    const token = jwt.sign({ user: body }, jwtSecret);
    let { password, __v, ...userDetails } = {
      ...user._doc,
    };
    return res.status(200).json({
      user: userDetails,
      Authorization: token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getUser = (req, res) => {
  if (req.query.userId) {
    if (mongoose.Types.ObjectId.isValid(req.query.userId)) {
      User.findById(req.query.userId).then((user) => {
        if (user) {
          let { password, __v, ...userDetails } = {
            ...user._doc,
          };
          return res.status(200).json({ user: userDetails });
        } else {
          res.status(400).json({ message: "Wrong user Id" });
        }
      });
    } else {
      res.status(400).json({ message: "Wrong user Id" });
    }
  } else {
    User.findById(req.user._id).then((user) => {
      if (user) {
        let { password, __v, ...userDetails } = {
          ...user._doc,
        };
        return res.status(200).json({ user: userDetails });
      } else {
        res.status(400).json({ message: "Wrong user Id" });
      }
    });
  }
};

exports.updateUser = (req, res) => {
  let userData = req.body;
  if (req.body.password) {
    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
      userData.password = hash;
    });
  }
  User.findOneAndUpdate(
    {
      _id: req.user._id,
    },
    { $set: userData } //send 1 for increment and send -1 for decrement
  ).then((user) => {
    if (user) {
      res.status(200).json({ message: "success" });
    } else {
      res.status(400).json({ message: "failed" });
    }
  });
};

exports.getdish=(req, res) => {

  food.find().then((food)=>{
    res.json(food)
}).catch((err)=>{
    console.log(err)
})

}
