const Types = require('../models/Types');
const Utils = require('../Utils');
const TypesController = {
    add_Types : async (req,res) => {
        try {
            const data = await new Types({
                title : req.body.title ,
                slug : Utils.slug(req.body.title) 
            })
    
            const save = await data.save() ;
            res.status(200).json({status :200 , message : save})
        } catch (error) {
            res.status(404).json({status : 404 , message : error });
        }
    },

    list_Types : async (req,res) => {
        try {
            const data = await Types.find() ;
            res.status(200).json(data);
        } catch (error) {
            res.status(404).json({status : 404 , message : error})
        }
    },

    getone_Types : async (req,res) => {
        try {
            const data = await Types.findOne({_id : req.params.id});
            if(data) {
                res.status(200).json(data) ;
            } else {
                res.status(404).json({status : 404 , message : "Không tìm thấy"})
            }

        } catch (error) {
            res.status(404).json({status : 404 , message : error});
        }
    },
    
    edit_Types : async (req,res) => {
        try {
            const data = await Types.findByIdAndUpdate(req.body._id , {
                title : req.body.title ,
                slug : Utils.slug(req.body.title) 
            })

            if(data) {
                res.status(200).json({status : 200 , message : 'Thành công'});
            } else {
                res.status(404).json({status : 404 , message : "Edit Thất bại"});
            }

        } catch (error) {
            res.status(404).json({status : 404 , message : error});
        }
    },

    del_Types: async(req,res) => {
        try {
            const del = await Types.deleteOne({_id : req.params.id});
            if (del.deletedCount === 1) {
                res.status(200).json({ status : 200 , message : 'Successfully deleted one document.'});
            } else {
                res.status(404).json({status : 404 ,message : 'No documents matched the query. Deleted 0 documents.'});
            }
        } catch (error) {
            res.status(404).json({status : 404 ,message : 'No documents matched the query. Deleted 0 documents.'});
        }
    }
}

module.exports = TypesController ;