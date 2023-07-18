const mongoose = require('mongoose');
const Forms = require('../models/Forms');
const Util = require('../Utils');
const FormsController = {
    Add_Forms : async (req,res) => {
        try {
            const form = new Forms({
                title : req.body.title , 
                name : req.body.name ,
                content : req.body.content ,
                posision : req.body.posision 
            })
            const menusave = await form.save();
            res.status(200).json({status : 200 , message : menusave});
        } catch (error) {
            res.status(200).json({status : 404 ,message : error});
        }
    },
    List_Forms : async (req,res) => {
        try {
            const menu = await Forms.find();
            res.status(200).json(menu);
        } catch (error) {
            res.status(404).json({message : error});
        }
    },
    Del_Forms  : async(req,res) => {
        try {
            try {
                const del = await Forms.deleteOne({_id : req.params.id});
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
    }
    
}
module.exports = FormsController ;