const router = require('express').Router();
let Menu = require('../models/menu');

/*add*/
router.route("/add").post((req,res)=>{

    const category_Id = req.body.id;
    const Name  = req.body.name;

    // const category_Id = 'req.body.id';
    // const Name  = 'req.body.name';
    // const Image  = 'req.body.image'; 

    const newMenu = new Menu({
        category_Id,       
        Name,                      
    })

    newMenu.save().then(()=>{
        res.json("Product added");
    }).catch((err)=>{
        console.log(err);
    })
})

/* update */
router.route("/update/:id").put(async(req,res)=>{

    let Id = req.params.id;

    /*get data from body*/

    // const {Item_Name,Quantity,Total_Cost,Re_Order_Level} = req.body;
    // const category_Id  = 'req.body.efg';
    // const Name = 'abc';

   
    const Name  = req.body.name;

    const updatemenu = {Name};  

    await Menu.updateOne({category_Id:Id},{$set:updatemenu})
    .then(()=>{
        res.status(200).send({status:"categories updated"})
    }).catch((err)=>{
        console.log(err);
        res.status(500).send({status:"catogories update failed", error:err});
    })
})

/*display*/
router.route("/").get((req,res)=>{

    Menu.find().sort({category_Id:1}).then((menu)=>{
        res.json(menu)
    }).catch((err)=>{
        console.log(err);
    })
})

/*delete*/
router.route("/delete/:id").delete(async(req,res)=>{
    
    let Id = req.params.id;

    await Menu.deleteOne({category_Id:req.params.id}).then(()=>{
        res.status(200).send({status:"Menu details deleted", user : Id})
    }).catch((err)=>{
        console.log(err);
        res.status(500).send({status:"Menu details delete failed", error:err});
    })
})

module.exports = router;