const mongoose = require('mongoose');

const newSchema = new mongoose.Schema({
    title       : {type : String , required : true} ,
    description : {type : String , required : true} ,
    image : {type : String } ,
    category_id : {type : mongoose.Types.ObjectId , ref : 'Categories'} ,
    link : {type : String } ,
    slug : {type : String } ,
    type_id : {type : mongoose.Types.ObjectId , ref : "Types"} ,
    outstanding : {type : Boolean , default : false} ,
    created_at  : {type : Date , default : Date.now()},
    updated_at  : {type : Date , default : Date.now()},
})

newSchema.index({title : "text"}); ;

const News = mongoose.model('News' , newSchema);
module.exports = News ;
