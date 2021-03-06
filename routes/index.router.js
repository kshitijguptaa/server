const express = require('express');
const router = express.Router();

const ctrlUser = require('../controllers/user.controller');

const jwtHelper = require('../config/jwtHelper');

router.post('/register', ctrlUser.register);
router.post('/authenticate', ctrlUser.authenticate);
router.get('/userProfile',jwtHelper.verifyJwtToken, ctrlUser.userProfile);
router.post('/updateUserProfile', jwtHelper.verifyJwtToken, ctrlUser.updateUserProfile);
router.get('/getAllUserList', jwtHelper.verifyJwtToken, ctrlUser.getAllUserList);
router.post('/sendReq', jwtHelper.verifyJwtToken, ctrlUser.sendFriendReq);
router.get('/getFriendListDetails', jwtHelper.verifyJwtToken, ctrlUser.getFriendListDetails);
router.post('/acceptReq', jwtHelper.verifyJwtToken, ctrlUser.acceptFriendReq);
router.post('/rejectReq', jwtHelper.verifyJwtToken, ctrlUser.rejectFriendReq);
router.post('/unfriend', jwtHelper.verifyJwtToken, ctrlUser.unfriend);
router.post('/profileUpload', jwtHelper.verifyJwtToken, ctrlUser.profileUpload);
router.get('/retriveImage', ctrlUser.retriveImage);


module.exports = router;



