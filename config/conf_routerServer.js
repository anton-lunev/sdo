'use strict';
/**
 ** Файл: ./config/routerServer.js
 ** Тип: Конфигурация
 ** Описание: Сценарий перенаправляет все запросы пользователей на контроллер (Server, express)
 **/
var mvc = require('../config/require.js');
var express = require('express');
var bodyParser = require('body-parser');

/**
 **
 **
 **/
var initEvents = function () {

    // В production env статика обрабатывается nginx
    if (process.env.NODE_ENV === 'development') {
        // Статика
        mvc['modules']['express'].use('/', express.static(mvc['config']['settings'].path + '/static/public/'));
        // Главная страница
        mvc['modules']['express'].get('/', mvc['controllers']['routerServer'].server.onIndex);
    }

    // Служебный route для проверки доступности приложения
    mvc['modules']['express'].get('/ping', mvc['controllers']['routerServer'].server.onPing);

    // parse application/x-www-form-urlencoded
    mvc['modules']['express'].use(bodyParser.urlencoded({ extended: false }));
    // parse application/json
    mvc['modules']['express'].use(bodyParser.json());

    // Роут платежей ВКонтакте
    mvc['modules']['express'].post('/payment/secure_callback', mvc['controllers']['routerServer'].server.onPaymentSecure);
};

exports.initEvents = initEvents;
