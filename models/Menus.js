const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
    title : {type : String} ,
    link  : {type : String} ,
    category_id : {type : mongoose.Types.ObjectId , ref : "Categories" , default : ''} ,
    slug : {type : String , default : ''} ,
    posision : {type : Number , default : 0} ,
    parent_id : {type : mongoose.Types.ObjectId , ref : "Menus" , default : null} 
})

const Menus = mongoose.model('Menus' , menuSchema);
module.exports = Menus ;
