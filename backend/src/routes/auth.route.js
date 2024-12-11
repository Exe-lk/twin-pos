const express = require("express");
const passport = require("passport");
const router = express.Router();
const userController = require("../controllers/user.controller");
const food=require("../models/food");

router.post("/signin", userController.signIn);
router.post("/signup", userController.signUp);
router.post("/googleauth", userController.googleAuth);
// router.get("/food", userController.getdish);
// router.get("/dish", userController.getdish);
// router.route("/dish").get((req,res)=>{
//     food.find().then((food)=>{
//         res.json(food)
//     }).catch((err)=>{
//         console.log(err)
//     })
// })


// router.get(
//   "/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// router.get(
//   "/google/callback",
//   passport.authenticate("google", {
//     session: false,
//     successRedirect: process.env.FRONTEND_URL,
//     failureRedirect: "/auth/signin",
//   }),
//   userController.googleAuth
// );

router.post("/send-otp", userController.sendOTP);
router.post("/change-password", userController.changePassword);

module.exports = router;
