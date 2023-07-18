const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
    title : {type : String } ,
    link  : {type : String} ,
    background : {type : String } 
})

const Partners = mongoose.model('Partners' , partnerSchema);
module.exports = Partners ;
