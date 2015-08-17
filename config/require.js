'use strict';


exports.modules = {
    io: require('socket.io'),
    socket: null, // экземпляр сервера io, app.js
    express: require('express')(),
    math: require('math'),
    md5: require('MD5'),
    signinGenerator: require('../modules/signinGenerator.js'),
    payment: require('../modules/payment.js'),
    cohort: require('../modules/cohort.js')
};
exports.fw = {
    ajax: require('../models/fw/mod_ajax.js'),
    deferredFunction: require('../models/fw/mod_deferredFunction.js'),
    user: require('../models/fw/mod_user.js')
};
exports.config = {
    settings: require('./conf_settings.js'),
    routerServer: require('./conf_routerServer.js'),
    routerSocket: require('./conf_routerSocket.js')
};
exports.controllers = {
    routerServer: require('../controllers/ctrl_routerServer.js'),
    routerSocket: require('../controllers/ctrl_routerSocket.js')
};
exports.models = {
    session: require('../models/mod_session.js'), // хранение сессий
    socketDataUsers: require('../models/mod_socketDataUsers.js'), // хранение информации о пользователях по ключу сокета
    meetings: require('../models/mod_meetings.js'), //
    meetingsController: require('../models/mod_meetingsController.js'), //
    meetingRooms: require('../models/mod_meetingRooms.js'), //
    dbUserModel: require('../models/db/UserModel.js'), //
    dbMeetingModel: require('../models/db/MeetingModel.js'), //
    dbRoomModel: require('../models/db/RoomModel.js'), //
    messenger: require('../models/mod_messenger.js'), //
    authorization: require('../models/mod_authorization.js'), //
    vk: require('../models/mod_vk.js') //
};
