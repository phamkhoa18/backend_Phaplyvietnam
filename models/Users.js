const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username : {type : String} ,
    password : {type : String , required : true} ,
    email    : {type : String , required : true} ,
    fullname : String , 
    address  : String , 
    phone    : Number ,
    admin    : {type : Boolean , default : false} ,
    avatar   : String 
})

const Users = mongoose.model('Users' , userSchema);
module.exports = Users ;

