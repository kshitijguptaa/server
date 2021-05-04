const mongoose = require('mongoose');


var userFriendSchema = new mongoose.Schema({
    friendList: {
        type: Array
    },
    friendRequest: {
        type: Array
    },
    requestSent: {
        type: Array
    },
    userReferenceId:{
        type: String
    },
    fullName: {
        type: String,
        required: 'Full name can\'t be empty',
       
    }
});

mongoose.model('userFriends', userFriendSchema);