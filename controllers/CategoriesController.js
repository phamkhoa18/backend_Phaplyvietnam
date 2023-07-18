const mongoose = require('mongoose');
const Categories = require('../models/Categories');
const Util = require('../Utils');
const CategoriesController = {

    Add_category : async (req,res) => {
      if(req.body.parent_id == '' ) {
          req.body.parent_id = null ;
      }
      try {
          const category = new Categories({
              title : req.body.title , 
              link : Util.slug(req.body.title) ,
              parent_id : req.body.parent_id || null,
              background : req.file ? req.file.filename : '',
              filter : req.body.filter
          })
          console.log(category);
          const categorysave = await category.save()
          res.status(200).json({status : 200 , message : categorysave});
      } catch (error) {
          res.status(404).json({status : 404 ,message : error});
      }
    },
    getCategories :  async(req,res) =>  {
        const categories = await Categories.find({ parent_id: null }).lean();
        async function getChildren(category) {
          const children = await Categories.find({ parent_id: category._id }).lean();
          if (children.length > 0) {
            category.children = children;
            for (let i = 0; i < children.length; i++) {
              await getChildren(children[i]);
            }
          }
        }
      
        for (let i = 0; i < categories.length; i++) {
          await getChildren(categories[i]);
        }
      
        res.json(categories);
      },

      List_category : async (req,res) => {
        try {
            const category = await Categories.find();
            res.status(200).json(category);
        } catch (error) {
            res.status(404).json({message : error});
        }
    },

    getOnecategory : async (req,res) => {
      try {

        console.log(req.params.id);
        const category = await Categories.findOne({_id : req.params.id});
        res.status(200).json(category);
    } catch (error) {
        res.status(404).json({message : error});
    }
    },

    editCategory: async (req, res) => {
      if (req.file) {
        Util.removeimage_uploads(req.body.background_old);
      }
     var uploadData = {
        title: req.body.title,
        link: Util.slug(req.body.title),
        parent_id : req.body.parent_id ,
        background: req.file ? req.file.filename : req.body.background,
        filter : req.body.filter
      }


      if(req.body.parent_id == 'null' || req.body.parent_id == '') {
        uploadData.parent_id = null ;
      }
      
      const categorydatabase = await Categories.findByIdAndUpdate(req.body._id, uploadData ); 

      if (!categorydatabase) {
        res.status(404).json({ status: 404, message: "sai id rồi" });
      } else {
        res.status(200).json({ status: 200, message: categorydatabase });
      }
    },

  delCategory : async(req,res) => {
      Util.removeimage_uploads(req.body.background);
      const del = await Categories.deleteOne({_id : req.body._id});

      if (del.deletedCount === 1) {
          res.status(200).json({status : 200 ,message : 'Successfully deleted one document.'});
        } else {
          res.status(404).json({status : 404 , message : 'No documents matched the query. Deleted 0 documents.'});
        }
  }
}

module.exports = CategoriesController ;