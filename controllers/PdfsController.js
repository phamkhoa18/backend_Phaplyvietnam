
const Pdfs = require('../models/Pdfs');
const Util = require('../Utils');

const PdfsController = {
    Add_Pdfs : async (req,res) => {
        try {
            const uploadedFiles = [] ;
            // Duyệt qua mỗi file và lấy tên mới của nó
            Object.keys(req.files).forEach(key => {
              const file = req.files[key][0]; // Lấy file đầu tiên nếu có nhiều file được upload với cùng một key
              uploadedFiles.push(file);
            }); 
        
            // Trả về mảng chứa tên của các file đã được upload
            // res.json({ message: 'Files uploaded successfully', uploadedFiles });
            const form = new Pdfs({
                title : req.body.title , 
                description : req.body.description,
                slug : Util.slug(req.body.title) ,
                link : req.body.link || `/pdf/detail/${Util.slug(req.body.title)}`,
                fileNamePdf : uploadedFiles || [] ,
                Unit8ArrayPdf : req.body.unit8array || ''
            });
            // // Util.TransformJsonToDoc(form) ;
            const formsave = await form.save();
            if(formsave ) {
                console.log('luu thanh cong');
                res.status(200).json({status : 200 , message : formsave});
            } else {
                res.status(200).json({status : 404});
            }
        } catch (error) {
            res.status(200).json({status : 404 ,message : error});
        }
    },

    Edit_Pdfs : async(req ,res) => {
        try {
            const uploadedFiles = [] ;
            // Duyệt qua mỗi file và lấy tên mới của nó
            Object.keys(req.files).forEach(key => {
              const file = req.files[key][0]; // Lấy file đầu tiên nếu có nhiều file được upload với cùng một key
              uploadedFiles.push(file);
            }); 

            console.log('uploadedFiles', uploadedFiles);

            const arrayFileNamePdf_old = JSON.parse(req.body.fileNamePdf_old);

            console.log('arrayFileNamePdf_old' , arrayFileNamePdf_old);

            

            var itemFind ; 
            if(uploadedFiles.length > 0) {
                const arrayfilePdfNew = [] ;
            
                uploadedFiles.forEach((e , i) => {
                    arrayFileNamePdf_old.forEach(async(t , k) => {
                            if(uploadedFiles[i].fieldname == t.fieldname) {
                                arrayfilePdfNew.push(e) ;
                                arrayFileNamePdf_old.splice(k , 1) ;
                                await Util.removepdf_document(t);
                            }
                    })
                })
                const arraypdfupdate =  arrayFileNamePdf_old.concat(arrayfilePdfNew);
                console.log(arraypdfupdate);
                

                 itemFind = await Pdfs.findByIdAndUpdate(req.body.id , {
                    title : req.body.title , 
                    description : req.body.description,
                    slug : Util.slug(req.body.title) || req.body.slug ,
                    link : req.body.link || `/pdf/detail/${Util.slug(req.body.title)}`,
                    fileNamePdf : arraypdfupdate || [] ,
                    Unit8ArrayPdf : req.body.unit8array || ''
                });
            } else {
                itemFind = await Pdfs.findByIdAndUpdate(req.body.id , {
                    title : req.body.title , 
                    description : req.body.description,
                    link : req.body.link || `/pdf/detail/${Util.slug(req.body.title)}`,
                    link : req.body.link || '',
                    Unit8ArrayPdf : req.body.unit8array || ''
                });
            }
            res.status(200).json({status : 200 , message : itemFind}) ;
        } catch (error) {
            res.status(404).json({message : error});
        }
    } , 

    Del_Pdfs : async (req,res) => {
        try {
            try {
                const del = await Pdfs.deleteOne({_id : req.params.id});
            if (del.deletedCount === 1) {
                res.status(200).json({ status : 200 , message : 'Successfully deleted one document.'});
              } else {
                res.status(200).json({ status : 404 , message : 'No documents matched the query. Deleted 0 documents.'});
              }
            } catch (error) {
                res.status(404).json({ status : 404 , message : "lỗi "});
            }
        } catch (error) {
            
        }
    } ,
    List_Pdfs : async (req,res) => {
        try {
            const menu = await Pdfs.find();
            res.status(200).json(menu);
        } catch (error) {
            res.status(404).json({message : error});
        }
    },

    getOne_Pdf_slug: async(req,res) => {
        try {
            const onePdf = await Pdfs.findOne({slug : req.params.name}) ;
            res.status(200).json({status : 200 , message : onePdf});
        } catch (error) {
            res.status(404).json({message : error});
        }
    },

    getOne_Pdfs:async(req,res) => {
        try {
            console.log(req.params.id);
            const partner = await Pdfs.findOne({_id : req.params.id});
            res.status(200).json(partner);
        } catch (error) {
            res.status(404).json({message : error});
        }
    },

    Handle_Update : async (req,res) => {
        try {
            const dataone = await Forms.findByIdAndUpdate(req.body.id , {
                name : req.body.name ,
                title : req.body.title ,
                content : req.body.content ,
                posision : req.body.posision ,
                seen : req.body.seen 
            })
            
            if(dataone) {
                res.status(200).json({status : 200 , message : "update thành công"});
            }
            else {
                res.status(404).json({status : 404 , message : "không thành công"});
            }
        } catch (error) {
            res.status(404).json({message : error});
        }
    },

    Xuly_contact : async (req,res) => {
        try {
            const count = await Forms.countDocuments({seen : false});
            res.status(200).json(count);
        } catch (error) {
            res.status(404).json(error);
        }
    },

    Send_Mail : async (req,res) => {

    }
    
}
module.exports = PdfsController ;