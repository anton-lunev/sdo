'use strict';
/** 
 ** Файл: ./config/conf_routerSocket.js
 ** Тип: Конфигурация
 ** Описание: Сценарий перенаправляет все запросы пользователей на контроллер (Socket.io)
 **/
var mvc = require('../config/require.js');

/**
 **
 **
 **/
var initEvents = function (client) {
	client.on("authorization", mvc['controllers']['routerSocket'].socket.authorization);
	client.on("disconnect", mvc['controllers']['routerSocket'].socket.disconnect);
	client.on("action", mvc['controllers']['routerSocket'].socket.action);
};

exports.initEvents = initEvents;
