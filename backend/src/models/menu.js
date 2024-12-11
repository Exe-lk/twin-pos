const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MenuSchema = new Schema({

    category_Id:{
        type:String,
        required:true
    },

    Name:{
        type:String,
        required:true
    },

});

const Menu = mongoose.model("Menu",MenuSchema);

module.exports = Menu;