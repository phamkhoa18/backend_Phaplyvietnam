const mongoose = require('mongoose');
const Sliders = require('../models/Sliders');
const Util = require('../Utils');
const SlidersControllere = {
    // ADD SLIDER
    Add_slider : async(req,res) => {
        try {
            const slider = new Sliders({
              title: req.body.title,
              description: req.body.description,
              image: req.file.filename,
              link: req.body.link,
              position: req.body.position
            });
            console.log(slider);
            const sliderSave = await slider.save();
            res.status(200).json({ status: 200, message: "Thêm slider thành công" });
          } catch (error) {
            console.error(error);
            res.status(500).json({ status: 500, message: "Lỗi rồi" });
          }
    },

    Edit_slider : async(req ,res) => {
      try {
        const sliderdata = await Sliders.findByIdAndUpdate(req.body._id , {
          title : req.body.title ,
          description : req.body.description ,
          image : req.body.image , 
      })
        const slidersave = await sliderdata.save() ;
        res.status(200).json({status : 200 , message : "Thêm slider thành công"});
    } catch (error) {
        res.status(404).json({status : 404 , message : "Lỗi rồi"});
    }
    },

    Edit_slider_image : async(req,res) => {
        try {
            const imagecurren = await Sliders.findById(req.body._id);
             Util.removeimage_uploads(imagecurren.image);
            // remove image in uploads 
            const sliderdata = await Sliders.findByIdAndUpdate(req.body._id , {
                title : req.body.title ,
                description : req.body.description ,
                image : req.file.filename , 
            })
            const slidersave = await sliderdata.save() ;
            res.status(200).json({status : 200 , message : "Edit slider thành công"});
        } catch (error) {
            res.status(404).json({status : 404 , message : "Lỗi rồi"});
        }
    },



    // LIST SLIDER
    List_slider : async(req ,res) => {
        try {
            const slider = await Sliders.find();
            res.status(200).json(slider);
        } catch (error) {
            res.status(404).json(error);
        }
    },

    get_one_slider : async(req,res) => {
        try {
            const slider = await Sliders.findOne({_id : req.params.id});
            res.status(200).json(slider);
        } catch (error) {
            res.status(404).json(error);
        }
    },


    // LIST SLIDER ONE POSISION 
    One_slider : async(req,res) => {
        try {
            const slider = await Sliders.findOne({posision : req.params.posision});
            if(slider) {
                res.status(200).json(slider);
            } else {
                res.status(404).json({message : "error"});
            }
        } catch (error) {
            res.status(404).json(error);
        }
    },

    Del_slider : async(req,res) => {
        try {
            const imagecurren = await Sliders.findById(req.params.id);
            Util.removeimage_uploads(imagecurren.image);
            
            const del = await Sliders.deleteOne({_id : req.params.id});
        if (del.deletedCount === 1) {
            res.status(200).json({status : 200 , message : 'Successfully deleted one document.'});
          } else {
            res.status(404).json({ status : 404 ,message : 'No documents matched the query. Deleted 0 documents.'});
          }
        } catch (error) {
            res.status(404).json(error);
        }
    }
}

module.exports = SlidersControllere ;