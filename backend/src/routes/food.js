const router = require("express").Router();
const food=require("../models/food");


router.route("/create").post((req,res)=>{


const Name=req.body.dishTitle
const Cat_id= Math.floor(Math.random() * (9999- 0) + 0);
const Description = req.body.dishDescription;
//const Ingridients = [['basmtthi',5 ,'kg']  , ['cokking oil',2 ,'l'] ];
const Ingridients = req.body. dishIngridients ;
const Price= req.body.dishPrice ;
const Picture="Still pending";
const ImageURL = req.body.ImageURL;
const  Category  = req.body.dishCategory ;


// ingridients:[{ name: String,  quantity : Number ,unittype : String }]
const newfood=new food({
    
    Name,
    Cat_id,
    Ingridients,
    Price,
    Picture,
    Description,
    ImageURL,
    Category 
    
    })

   // console.log(req.body);
    newfood.save().then(()=>{

    }).catch((err)=>{
        console.log(err);
    })

})

router.route("/").get((req,res)=>{
    food.find().then((food)=>{
        res.json(food)
    }).catch((err)=>{
        console.log(err)
    })
})

exports.updateUser = (req, res) => {
    food.find().then((food)=>{
        res.json(food)
    }).catch((err)=>{
        console.log(err)
    })
  };

router.route("/viewDish").get(async(req,res)=>{

    food
        .find()
        .then((items) => res.json(items))
        .catch((err) => console.log(err))
});

router.route("/count").get((req,res)=>{
    food.count().then((food)=>{
        res.json(food)
    }).catch((err)=>{
        console.log(err)
    })
})

router.route("/delete/:id").delete(async(req,res)=>{

    food.findByIdAndDelete({_id:req.params.id})
    .then((doc) => console.log(doc))
    .catch((err) => console.log(err));
});

router.route("/update/:id").put(async(req,res)=>{

    food.findByIdAndUpdate(
        {_id: req.params.id} ,{
            Name : req.body.title,
            Description : req.body.description,
            Price : req.body.price       
    
    }
       ).then((doc) => console.log(doc))
        .catch((err) => console.log(err));
    
    });

module.exports=router;