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


module.exports = router;



