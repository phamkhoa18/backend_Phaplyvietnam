const mongoose = require('mongoose');
const Settings = require('../models/Settings');
const Util = require('../Utils');
const nation = require('../nation');
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

    Get_Settings : async(req ,res) => {
        try {
            const list = await Settings.find({posision : req.params.posision});
            res.status(200).json(list);
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