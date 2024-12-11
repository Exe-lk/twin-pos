const mongoose= require('mongoose');
const Schema=mongoose.Schema;
const foodSchema=new Schema({
 
  
    Name:{
        type: String,
        required: true
    },
    Cat_id:{
        type: String,
        required: true
    },

    Ingridients:[]
    ,

    Price:{
        type: String,
        required: true
    },
    Picture:{
        type: String,
        // required: true
    }
    ,
    Description :{
        type: String,
        required: true
    },
    ImageURL:{
        type: String,
        required: true
    },
    Category:{
        type: String,
        required: true
    }

})
const food = mongoose.model("food",foodSchema);

module.exports=food;