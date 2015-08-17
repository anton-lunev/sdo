'use strict';
/**
 * Файл: ./app.js
 * Тип: Приложение
 * Описание: Сценарий запускает сервер
 */
var mvc = require('./config/require.js');
require('./config/log.js');

mvc['config']['settings'].path = __dirname;

// Connect to mongodb
var mongoose = require('mongoose');
mongoose.connect(mvc['config']['settings'].conf.db_url);

function init() {
    // Информация о приложении
    log(__filename, 'Application mode <' + mvc['config']['settings'].mode + '> version <'
        + mvc['config']['settings'].conf.version + '>');
    log(__filename, 'Server and Socket.io listening on port ' + mvc['config']['settings'].conf.server.port);

    // Сервер Express
    var server = mvc['modules']['express'].listen(mvc['config']['settings'].conf.server.port, function () {
        mvc['config']['routerServer'].initEvents();
    });

    // Сервер Socket.io
    var socket = mvc.modules.io.listen(server);
    mvc['modules']['socket'] = socket;
    socket.eio.transports = ['websocket'];
    socket.engine.transports = ['websocket'];

    socket.sockets.on("connection", mvc['config']['routerSocket'].initEvents);

    // Загружаем встречи из БД
    mvc["models"]["meetings"].control.loadDBMeetings();
    mvc["models"]["session"].control.autoClearData();
    //mvc["models"]["meetingRooms"].control.testRoom({ id: '2015-05-22T12:40:39.000Zcity2age15-350',
    //    man: [ 'Антон Лунев','Андрей Сорока', 'Тема Барановский', 'Виктор'],
    //    woman: [ 'Юля', 'Лоис', 'катя', null ],
    //    offsetAction: 0,
    //    timeStart: 1432298439213,
    //    timeMeeting: 60000,
    //    timePause: 15000,
    //    sympathies: {}});
}

init();
