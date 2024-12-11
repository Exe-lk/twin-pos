const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const FaqSchema = new Schema({

    category : {
        type: String,
        required : true
    },

    question : {
        type: String,
        required : true
    },

    answer : {
        type: String,
        required : true
    }

})

const faq = mongoose.model("Faq",FaqSchema);

module.exports =faq;

