const mongoose = require('mongoose');

const FormSchema = new mongoose.Schema({
    name : String ,
    title : String , 
    content : []  ,
    posision : String  ,
    seen : {type : Boolean , default : false} ,
    date : {type : Date , default : Date.now()},
    attach : [] 
})

const Forms = mongoose.model('Forms' , FormSchema);
module.exports = Forms ;
