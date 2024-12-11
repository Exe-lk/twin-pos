const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: false },
  name: { type: String, required: false },
  phoneNumber: { type: String, required: false },
  gender: { type: String, required: false },
  address: { type: String, required: false },
  otp: { type: String, required: false }, //to store otp code
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
