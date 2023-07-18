const mongoose = require('mongoose');
const Partners = require('../models/Partners');
const Util = require('../Utils');
const PartnersController = {

    Add_partner : async (req,res) => {
      try {
          const partner = new Partners({
              title : req.body.title , 
              link : req.body.link ,     
              background : req.file ? req.file.filename : ''
          })
          const partnersave = await partner.save() ;
          res.status(200).json({status : 200 , message : partnersave});
      } catch (error) {
          res.status(404).json({status : 404 ,message : error});
      }
    },

      List_partner : async (req,res) => {
        try {
            const partner = await Partners.find();
            res.status(200).json(partner);
        } catch (error) {
            res.status(404).json({message : error});
        }
    },

    getOnePartner : async (req,res) => {
      try {
        console.log(req.params.id);
        const partner = await Partners.findOne({_id : req.params.id});
        res.status(200).json(partner);
        } catch (error) {
            res.status(404).json({message : error});
        }
    },

    editPartner: async (req, res) => {
      if (req.file) {
        Util.removeimage_uploads(req.body.background_old);
      }
    var uploadData = {
        title: req.body.title,
        link: Util.slug(req.body.title),
        background: req.file ? req.file.filename : req.body.background,
    }
      
      const categorydatabase = await Partners.findByIdAndUpdate(req.body._id, uploadData ); 

      if (!categorydatabase) {
        res.status(404).json({ status: 404, message: "sai id rồi" });
      } else {
        res.status(200).json({ status: 200, message: categorydatabase });
      }
    },

  delPartner : async(req,res) => {
      Util.removeimage_uploads(req.body.background);
      const del = await Partners.deleteOne({_id : req.body._id});

      if (del.deletedCount === 1) {
          res.status(200).json({status : 200 ,message : 'Successfully deleted one document.'});
        } else {
          res.status(404).json({status : 404 , message : 'No documents matched the query. Deleted 0 documents.'});
        }
  }
}

module.exports = PartnersController ;