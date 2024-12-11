const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
// const food=require("../models/food");

router.get("/details", userController.getUser);
router.put("/details", userController.updateUser);
router.get("/dish", userController.getdish);


module.exports = router;
