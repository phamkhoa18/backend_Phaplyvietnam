const mongoose = require('mongoose');
const Settings = require('../models/Settings');
const Util = require('../Utils');
const nation = require('../nation');
const skill = require('../listdata.json');
const tp_vn = require('../tp_vn');
const axios = require('axios');
const path = require('path');

var customEmails = [] ;

const SettingsController = {

    Add_Settings : async (req,res) => {
        try {
            const settings = new Settings({
                title : req.body.title || '', 
                description : req.body.description || '' ,
                link : req.body.link || '' ,
                image : req.file ? req.file.filename : '' ,
                posision : req.body.posision
            })
            console.log(settings);
            const settingssave = await settings.save()
            res.status(200).json({status : 200 , message : settingssave});
        } catch (error) {
            res.status(404).json({status : 404 ,message : error});
        }
    },

    Add_Pdf : async (req,res) => {
        try {
          var mailOptions ;
          mailOptions = await Util.readFdfContentUpdate('form80.pdf' , req.body.data);
          await Util.guiEmailChoBan(mailOptions);
          
          res.status(200).json({status : 200, filename : mailOptions.attachments[0].filename });
        } catch (error) {
          res.status(404).json({status : 404 ,message : error});
        }
    },

    Get_Settings : async(req ,res) => {
        try {
            const list = await Settings.find({posision : req.params.posision});
            res.status(200).json(list);
        } catch (error) {
            res.status(404).json(error);
        }
    },

    ProcessHandleSetTimeOut_Email : async (req,res)=> {
      try {
        
      } catch (error) {
        
      }
    } ,

    Submit_Emails : async (req,res) => {
        try {
          console.log(req.body.arraynamefile , req.body.outdir);
          // check array file name in [outdir] exists

          // const filePath_out = path.join(req.body.outdir, req.body.link);
          // // Gửi thông tin đó vào gmail 
          // const mailOptions = {
          //   from: 'thongtinkhachhangphaply@gmail.com', // Điền email Gmail của bạn
          //   to: `${req.body.email}`, // Điền địa chỉ email của khách hàng
          //   subject: req.body.link,
          //   text: 'ĐÂY LÀ EMAIL TỰ ĐỘNG CỦA TRỢ GIÚP PHÁP LÝ VIỆT NAM',
          //   html: '<p>File data copy tu phaplyvietnam.com , Thank you !</p>',
          //   attachments: [
          //     {
          //       filename: req.body.link,
          //       path: filePath_out,
          //     }
          //   ],
          // };

          // console.log(mailOptions);
          // await Util.guiEmailChoBan(mailOptions);
          // res.status(200).json({status : 200 , message : 'success'});
        } catch (error) {
          res.status(404).json(error);
        }
    },
    

    Del_Settings : async(req,res) => {
      Util.removeimage_uploads(req.body.image);
      const del = await Settings.deleteOne({_id : req.body._id});

      if (del.deletedCount === 1) {
          res.status(200).json({status : 200 ,message : 'Successfully deleted one document.'});
        } else {
          res.status(404).json({status : 404 , message : 'No documents matched the query. Deleted 0 documents.'});
        }
  },

  get_nation : async (req,res) => {
      try {
        res.status(200).json(nation);
      } catch (error) {
        res.status(404).json(error);
      }
  },

  Download : async (req ,res) => {
    try {
            // Đường dẫn tới tệp bạn muốn tải xuống
  
            const uploadDir = path.join(__dirname, '..', 'document');    
        const filePath = path.join(uploadDir, 'ho_chieu.docx');
        console.log(filePath);



        // Tên tệp sẽ được sử dụng khi tải xuống
        const fileName = 'ho_chieu' + Date.now() + '.docx';

        // Đặt các thông tin liên quan đến việc tải xuống
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-Type', 'application/pdf');

        // Gửi tệp về cho trình duyệt để tải xuống
        res.sendFile(path.resolve(filePath));
    } catch (error) {
        res.status(404).json(error)
    }
  },

  get_tp_vn : async (req,res) => {
    try {
      res.status(200).json(tp_vn);
    } catch (error) {
      res.status(404).json(error);
    }
},

get_Currency : async (req , res) =>  {
    try {

      const { from, to, amount } = req.query;
      
      const exchangeRates = response.data.rates;

      res.status(200).json(exchangeRates);

    
    } catch (error) {
      
    }
},

getskill: async(req,res) => {
  try {
    res.status(200).json(skill);
  } catch (error) {
    res.status(404).json(error);
  }
},

  Edit_Settings : async(req,res) => {
    
   try {
    if (req.file) {
        Util.removeimage_uploads(req.body.background_old);
      }
     var uploadData = {
        title: req.body.title ,
        link : req.body.link ,
        description : req.body.description ,
        image: req.file ? req.file.filename : req.body.image,
        posision : req.body.posision
      }
      
      const categorydatabase = await Settings.findByIdAndUpdate(req.body._id, uploadData ); 

      if (!categorydatabase) {
        res.status(404).json({ status: 404, message: "sai id rồi" });
      } else {
        res.status(200).json({ status: 200, message: categorydatabase });
      }

   } catch (error) {
    res.status(404).json({ status: 404, message: error });
   }
}
}

module.exports = SettingsController ;