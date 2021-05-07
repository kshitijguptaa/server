const mongoose = require('mongoose');
const passport = require('passport');
const _ = require('lodash');
const { update } = require('lodash');
const { use } = require('../routes/index.router');
const e = require('express');
const multer = require('multer');
var DIR = './uploads/';
var upload = multer({dest: DIR}).single('photo');
const User = mongoose.model('User');
const UserFriend = mongoose.model('userFriends');
// const data = require('../uploads')

module.exports.register = (req, res, next) => {
    var user = new User();
    user.fullName = req.body.fullName;
    user.email = req.body.email;
    user.password = req.body.password;
    user.city = req.body.city;
    user.state = req.body.state;
    user.country =  req.body.country;
    user.save((err, doc) => {
        if (!err) {
        var userFriend = new UserFriend();
        userFriend.fullName = req.body.fullName
        userFriend.userReferenceId = (doc._id).valueOf()
        userFriend.friendList = []
        userFriend.friendRequest = []
        userFriend.requestSent = []
        userFriend.save((err, docs)=>{
            res.send(docs);
        })
    }
        else {
            if (err.code == 11000)
                res.status(422).send(['Duplicate email adrress found.']);
            else
                return next(err);
        }

    });
    
    
}
module.exports.authenticate = (req, res, next) => {
    // call for passport authentication
    passport.authenticate('local', (err, user, info) => {       
        // error from passport middleware
        if (err) return res.status(400).json(err);
        // registered user
        else if (user) return res.status(200).json({ "token": user.generateJwt() });
        // unknown user or wrong password
        else return res.status(404).json(info);
    })(req, res);
}
module.exports.userProfile = (req, res, next) =>{
    User.findOne({ _id: req._id },
        (err, user) => {
            if (!user)
                return res.status(404).json({ status: false, message: 'User record not found.' });
            else
                return res.status(200).json({ status: true, user : _.pick(user,['fullName','email', 'city', 'state', 'country']) });
        }
    );
}
module.exports.updateUserProfile = (req,res,next) => {
    User.findByIdAndUpdate(req._id , req.body, function (err, update) {
        if(!update)
        return res.status(202).json({ status: false, message: 'User record not found.' });
        else
        return res.status(200).json({ status: true, update : _.pick(update,['fullName','email', 'city', 'state', 'country']) });
      });
}
module.exports.getAllUserList = (req,res,next) => {
    User.find({}, function(err, results) { 
        if(!results)
        return res.status(202).json({ status: false, message: 'Users not found.' });
        else
        var filterResult =  results.filter(function(obj) {
            return obj._id != req._id;
        });
        return res.status(200).json({ status: true, filterResult});
    });
}
module.exports.sendFriendReq = (req,res,next) => {
    let reqRecieverData
    let reqSenderData
    //find req reciever data 
  UserFriend.findOne({ userReferenceId: req.body.id },
        (err, recieverData) => {
            if (!recieverData)
                return res.status(404).json({ status: false, message: 'User record not found.' });
            else {
            reqRecieverData = recieverData
             //find req senders data
            UserFriend.findOne({ userReferenceId: req._id },
                (err, sendersData) => {
                    if (!sendersData)
                        return res.status(404).json({ status: false, message: 'User record not found.' });
                    else {
                    reqSenderData = sendersData
                    if(reqRecieverData['friendRequest'].length === 0) {
                        //update directly
                        const json = {}
                        json['fullName'] = reqSenderData.fullName
                        json['id'] = reqSenderData.userReferenceId
                        reqRecieverData['friendRequest'].push(json)
                        UserFriend.findByIdAndUpdate(reqRecieverData._id , reqRecieverData, function (err, updateFriendReqReciever) {
                            if(!updateFriendReqReciever)
                            return res.status(202).json({ status: false, message: 'User record not found.' });
                            else{
                                reqSenderData['requestSent'].push(req.body)
                                UserFriend.findByIdAndUpdate(reqSenderData._id , reqSenderData, function (err, updateFriendReqSender) {
                                    if(!updateFriendReqSender)
                                    return res.status(202).json({ status: false, message: 'User record not found.' });
                                    else{
                                    return res.status(200).json({ status: false, updateFriendReqSender });
                                    }
                                });
                            }
                          });
                    } else {
                        const checkReq = []
                        reqRecieverData['friendRequest'].forEach(obj => {
                            if(obj.id === req.body.id){
                                checkReq.push(obj.id)
                                // return res.status(200).json({ status: false, message: 'Friend Request Sent Already' });
                            }
                        });
                        if(checkReq.length === 0) {
                            const json = {}
                            json['fullName'] = reqSenderData.fullName
                            json['id'] = reqSenderData.userReferenceId
                            reqRecieverData['friendRequest'].push(json)
                            UserFriend.findByIdAndUpdate(reqRecieverData._id , reqRecieverData, function (err, updateFriendReqReciever) {
                                if(!updateFriendReqReciever)
                                return res.status(202).json({ status: false, message: 'User record not found.' });
                                else{
                                    if(reqSenderData['requestSent'].length === 0){
                                        reqSenderData['requestSent'].push(req.body)
                                        UserFriend.findByIdAndUpdate(reqSenderData._id , reqSenderData, function (err, updateFriendReqSender) {
                                            if(!updateFriendReqSender)
                                            return res.status(202).json({ status: false, message: 'User record not found.' });
                                            else{
                                            return res.status(200).json({ status: false, updateFriendReqSender });
                                            }
                                        });
                                    } else {
                                        const checkReqSender = []
                                        reqSenderData['requestSent'].forEach(obj => {
                                            if(obj.id === req.body.id){
                                                checkReqSender.push(obj.id)
                                            }
                                        });
                                        if(checkReqSender.length === 0){
                                            reqSenderData['requestSent'].push(req.body)
                                            UserFriend.findByIdAndUpdate(reqSenderData._id , reqSenderData, function (err, updateFriendReqSender) {
                                                if(!updateFriendReqSender)
                                                return res.status(202).json({ status: false, message: 'User record not found.' });
                                                else{
                                                return res.status(200).json({ status: false, updateFriendReqSender });
                                                }
                                            });
                                        } else{
                                            return res.status(200).json({ status: false, message: 'Friend Request Sent Already' });
                                        }
                                        
                                    }
                                }
                            });
                        } else {
                                return res.status(200).json({ status: false, message: 'Friend Request Sent Already' });

                        }
                        
                    }

                    }
                }
            );
            }
        }
    );
   
    

}
module.exports.acceptFriendReq = (req,res,next) => {
    //acccepter side
    UserFriend.findOne({ userReferenceId: req._id },
        (err, accepter) => {
            if (!accepter){
                return res.status(404).json({ status: false, message: 'User record not found.' });
            }
            else{
                let itemToDel
                accepter.friendRequest.forEach(obj => {
                    if(obj.id === req.body.id){
                        itemToDel = obj
                    }
                });
                var filtered = accepter.friendRequest.filter(function(el) { return el.id != itemToDel.id; });
                accepter.friendRequest = filtered
                accepter.friendList.push(itemToDel)
                UserFriend.findByIdAndUpdate(accepter._id , accepter, function (err, updateAccepter) {
                    if(!updateAccepter){
                    return res.status(202).json({ status: false, message: 'User record not found.' });
                    }
                    else{
                        UserFriend.findOne({ userReferenceId: req.body.id },
                            (err, sender) => {
                                if (!sender){
                                    return res.status(404).json({ status: false, message: 'User record not found.' });
                                }
                                else{
                                    let idToDel
                                    sender.requestSent.forEach(obj => {
                                        if(obj.id === req._id){
                                            idToDel = obj
                                        }
                                    });
                                    var filterData = sender.requestSent.filter(function(el) { return el.id != idToDel.id; });
                                    sender.requestSent = filterData
                                    sender.friendList.push(idToDel)
                                    UserFriend.findByIdAndUpdate(sender._id , sender, function (err, updateSender) {
                                        if(!updateSender){
                                            return res.status(202).json({ status: false, message: 'User record not found.' });
                                        }
                                        else
                                        return res.status(200).json({ status: true, updateSender });
                                      });
                                }
                            }
                        );
                    }
                  });
            }
                
        }
    );
}
module.exports.rejectFriendReq = (req,res,next) => {
    UserFriend.findOne({ userReferenceId: req._id },
        (err, toDelete) => {
            if (!toDelete)
                return res.status(404).json({ status: false, message: 'User record not found.' });
            else{
            let idToDel
            toDelete.friendRequest.forEach(obj => {
                if(obj.id === req.body.id){
                    idToDel = obj
                }
            });
            var afterDel = toDelete.friendRequest.filter(function(el) { return el.id != idToDel.id; });
            toDelete.friendRequest = afterDel
            UserFriend.findByIdAndUpdate(toDelete._id , toDelete, function (err, update) {
                if(!update)
                return res.status(202).json({ status: false, message: 'User record not found.' });
                else{
                    UserFriend.findOne({ userReferenceId: req.body.id },
                        (err, toDeleteOther) => {
                            if (!toDeleteOther)
                                return res.status(404).json({ status: false, message: 'User record not found.' });
                            else{
                                let itemToDel
                                toDeleteOther.requestSent.forEach(element => {
                                    if(element.id === req._id){
                                        itemToDel = element
                                    }
                                });
                        var afterDelOther = toDeleteOther.requestSent.filter(function(el) { return el.id != itemToDel.id; });
                                toDeleteOther.requestSent = afterDelOther
                                User.findByIdAndUpdate(toDeleteOther._id , toDeleteOther, function (err, update) {
                                    if(!update)
                                    return res.status(202).json({ status: false, message: 'User record not found.' });
                                    else
                                    return res.status(200).json({ status: true, update });
                                  });
                            }
                        }
                    );
                }
              });
            }
        }
    );
}
module.exports.unfriend = (req,res,next) => {
    UserFriend.findOne({ userReferenceId: req._id },
        (err, toDelete) => {
            if (!toDelete)
                return res.status(404).json({ status: false, message: 'User record not found.' });
            else{
            let idToDel
            toDelete.friendList.forEach(obj => {
                if(obj.id === req.body.id){
                    idToDel = obj
                }
            });
            var afterDel = toDelete.friendList.filter(function(el) { return el.id != idToDel.id; });
            toDelete.friendList = afterDel
            UserFriend.findByIdAndUpdate(toDelete._id , toDelete, function (err, update) {
                if(!update)
                return res.status(202).json({ status: false, message: 'User record not found.' });
                else{
                    UserFriend.findOne({ userReferenceId: req.body.id },
                        (err, toDeleteOther) => {
                            if (!toDeleteOther)
                                return res.status(404).json({ status: false, message: 'User record not found.' });
                            else{
                                let itemToDel
                                toDeleteOther.friendList.forEach(element => {
                                    if(element.id === req._id){
                                        itemToDel = element
                                    }
                                });
                        var afterDelOther = toDeleteOther.friendList.filter(function(el) { return el.id != itemToDel.id; });
                                toDeleteOther.friendList = afterDelOther
                                User.findByIdAndUpdate(toDeleteOther._id , toDeleteOther, function (err, update) {
                                    if(!update)
                                    return res.status(202).json({ status: false, message: 'User record not found.' });
                                    else
                                    return res.status(200).json({ status: true, update });
                                  });
                            }
                        }
                    );
                }
              });
            }
        }
    );
}
module.exports.getFriendListDetails = (req,res,next) => {
    UserFriend.find({}, function(err, results) { 
        if(!results)
        return res.status(202).json({ status: false, message: 'Users not found.' });
        else
        var filterResult =  results.filter(function(obj) {
            return obj.userReferenceId == req._id;
        });
        return res.status(200).json({ status: true, filterResult});
    });
}
module.exports.profileUpload = (req,res,next) => {
    var path = '';
     upload(req, res, function (err) {
        if (err) {
          // An error occurred when uploading
          console.log(err);
          return res.status(422).send("an Error occured")
        }  
       // No error occured.
        path = req.file.path;
        return res.send("Upload Completed for "+path); 
  });     
}
module.exports.retriveImage = (req,res,next) => {
    const filePath = 'F:/My-Job-Portfolio/job-project/server/uploads/0a0172bd15f831f674634b3732a777dc'
    res.sendFile(filePath);
}

