const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    title : {type : String } ,
    description : {type : String },
    link  : {type : String} ,
    image : {type : String },
    posision : {type : String }
})

const Settings = mongoose.model('Settings' , settingSchema);
module.exports = Settings ;
