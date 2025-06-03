const mongoose = require('mongoose');

const pdfSchema = new mongoose.Schema({
    title       : {type : String } ,
    slug : {type : String , default : ''} ,
    link : {type : String , default : ''} ,
    description : {type : String , default : ''} ,
    fileNamePdf   : [] ,
    Unit8ArrayPdf : [],
    created_at  : {type : Date , default : Date.now()},
    updated_at  : {type : Date , default : Date.now()},
})

const Pdfs = mongoose.model('Pdfs' , pdfSchema);
module.exports = Pdfs ;
