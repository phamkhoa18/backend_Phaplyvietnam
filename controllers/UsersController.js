const mongoose = require('mongoose');
const Users = require('../models/Users');
const bcrypt = require('bcryptjs');
const UsersController = {
       Register : async(req,res) => {
        try {
            const user = new Users({
                username : req.body.username , 
                password : req.body.password ,
                email    : req.body.email ,
                fullname : req.body.fullname ,
                address  : req.body.address ,
                phone    : req.body.phone , 
                admin    : req.body.admin ,
                avatar   : req.body.avatar 
            })
            const userdata = await Users.findOne({email : user.email});
            if(userdata) {
                res.status(404).json({message : "This account already exists"});
            } else {
                bcrypt.hash(user.password , 10 ,async (err, v) => {
                    user.password = v ;
                    const usersave = await user.save();
                    res.status(200).json(usersave);
                });
            }
        } catch (error) {
            res.status(404).json({message : error});
        }
       },


       // LOGIN USER
    Login : async (req,res) => {
        try {
            const user = new Users({
                password : req.body.password ,
                email    : req.body.email ,
            })
            const userdata = await Users.findOne({email : user.email});
            if(userdata) {
                bcrypt.compare(user.password , userdata.password)
                    .then((result) => {
                        if(result) {
                            res.status(200).json({status : 200 , message : userdata});
                        }else {
                            res.status(200).json({status : 404 ,message : "email or password is incorrect"});
                        }
                    })
            } else {
                res.status(200).json({status : 404 ,message : "email or password is incorrect"});
            }
        } catch (error) {
            res.status(200).json({status : 404 ,message : "email or password is incorrect"});
        }
    }
}

module.exports = UsersController ;