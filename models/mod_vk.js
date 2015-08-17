'use strict';

/**
 ** Файл: ./models/mod_vk.js
 ** Тип: Модель
 ** Описание: Сценарий отвечает за отправление серверных запросов в ВК
 ** Объект: mvc['models']['vk']
 **/
var mvc = require('../config/require.js');

var VK = require('vksdk');

var vk = new VK({
    appId     : mvc['config']['settings'].conf.vkApp.id,
    appSecret : mvc['config']['settings'].conf.vkApp.secret,
    language  : 'ru'
});

vk.on('http-error', function(_e) {
    log(__filename, _e);
});

// Setup server access token for server API methods
vk.on('serverTokenReady', function(_o) {
    log(__filename, _o);

    // Here will be server access token
    vk.setToken(_o.access_token);
});

// Turn on requests with access tokens
vk.setSecureRequests(true);

// Request access token
vk.requestServerToken();

var control = {

    /**
     * Отправляем пользователям уведомления о начале встречи
     * @param {array} users - массив идентификаторов пользователей
     * @param {string} message - текст сообщения
     */
    sendMeetingNotify: function (users, message) {
        if (!users || !users.length) {
            log(__filename, 'No users to notify about meeting');
            return;
        }

        // Отправляем запрос
        vk.request('secure.sendNotification', {user_ids: users.join(','), message: message}, function(_dd) {
            log(__filename, _dd);
        });
    }
};

exports.control = control;
