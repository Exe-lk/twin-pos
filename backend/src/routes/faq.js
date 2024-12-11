const router = require("express").Router();
const faq = require("../models/faq");


//Read

router.route("/").get((req,res) =>{

    faq.find().then((faq) =>{
        res.json(faq)
    }).catch((err) =>{
        console.log(err)
    })
})


module.exports = router;