const mongoose = require('mongoose');
const passport = require('passport');
const _ = require('lodash');
const { update } = require('lodash');
const { use } = require('../routes/index.router');

const User = mongoose.model('User');
const UserFriend = mongoose.model('userFriends');

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
    UserFriend.findOne({ userReferenceId: req._id },
        (err, user) => {
            if (!user)
                return res.status(404).json({ status: false, message: 'User record not found.' });
            else{
                if(user['requestSent'].length != 0){
                    user['requestSent'].forEach(element => {
                        if(element.id === req.body.id) {
                        return res.status(200).json({ status: true, user});  
                        } else {
                             user['requestSent'].push(req.body)
                UserFriend.findByIdAndUpdate(user._id , user, function (err, update) {
                    if(!update)
                    return res.status(202).json({ status: false, message: 'User record not found.' });
                    else {
                        UserFriend.findOne({ userReferenceId: req.body.id },
                            (err, reqUser) => {
                                if (!reqUser)
                                    return res.status(404).json({ status: false, message: 'User record not found.' });
                                else{
                                    const json = {}
                                    json['id'] = req._id
                                    json['fullName'] = req.body.fullName
                                    reqUser['friendRequest'].push(json)
                                    UserFriend.findByIdAndUpdate(reqUser._id , reqUser, function (err, update) {
                                       if(!update)
                                       return res.status(202).json({ status: false, message: 'User record not found.' });
                                       else{
                                       UserFriend.find({}, function(err, results) { 
                                           if(!results)
                                           return res.status(202).json({ status: false, message: 'Users not found.' });
                                           else
                                           {
                                           var filterResult =  results.filter(function(obj) {
                                               return obj.userReferenceId == req._id;
                                           });
                                           return res.status(200).json({ status: true, filterResult});
                                        }
                                       });
                                    }
                                     });
                                }
                                    
                            }
                        );
                   
                }
                  });
                 
                        }
                    });
                } else {
                    user['requestSent'].push(req.body)
                    UserFriend.findByIdAndUpdate(user._id , user, function (err, update) {
                       
                        if(!update)
                        return res.status(202).json({ status: false, message: 'User record not found.' });
                        else{
                            UserFriend.findOne({ userReferenceId: req.body.id },
                                (err, reqUser) => {
                                    if (!reqUser)
                                        return res.status(404).json({ status: false, message: 'User record not found.' });
                                    else{
                                        console.log('111111', reqUser)
                                        const json = {}
                                        json['id'] = req._id
                                        json['fullName'] = req.body.fullName
                                        reqUser['friendRequest'].push(json)
                                        UserFriend.findByIdAndUpdate(reqUser._id , reqUser, function (err, update) {
                                            console.log('update======', update);
                                           if(!update)
                                           return res.status(202).json({ status: false, message: 'User record not found.' });
                                           else {
                                           UserFriend.find({}, function(err, results) { 
                                               if(!results)
                                               return res.status(202).json({ status: false, message: 'Users not found.' });
                                               else{
                                               var filterResult =  results.filter(function(obj) {
                                                   return obj.userReferenceId == req._id;
                                               });
                                               return res.status(200).json({ status: true, filterResult});
                                            }
                                           });
                                        }
                                         });
                                    }
                                        
                                }
                            );
                }
                      });
                }
             
               
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

