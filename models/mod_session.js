'use strict';
//todo переименовать в sessionDataUsers
/**
 ** Файл: ./models/mod_session.js
 ** Тип: Модель
 ** Описание: Сценарий отвечает за хранение, поиск, получение и создание сессии
 ** Объект: mvc['models']['session']
 **/
var mvc = require('../config/require.js');

// 30 минут
var MIN_30 = 2 * 60 * 1000;

var session = {};

var control = {
    /**
     *
     * @param options
     * @returns {*}
     */
    addData: function (options) {
        // если сессия существует, обновляем некоторые поля
        var getData = this.getData(options.id);
        if (getData) {
            log(__filename, 'update session', options.id);
            if (options.bdate) getData.bdate = options.bdate;
            if (options.city) getData.city = options.city;
            if (options.cityName) getData.cityName = options.cityName;
            if (options.cityId) getData.cityId = options.cityId;
            return getData;
        }

        return session[options.id] = options;
    },

    /** getSession(id)
     **
     ** Получение сессии по ее идентификатору
     **/
    getData: function (sessionId) {
        if (!sessionId || !session.hasOwnProperty(sessionId)) {
            return false;
        }

        return session[sessionId];
    },

    /**
     * обновление сессии и бд
     * @param sessionId
     * @param key
     * @param value
     * @returns {boolean}
     */
    setData: function (sessionId, key, value) {
        var session = this.getData(sessionId);
        if (!session) {
            return false;
        }

        session[key] = value;
        mvc['models']['dbUserModel'].setUserField(sessionId, key, value);

        return true;
    },

    /**
     * Авто очищение сессии
     */
    autoClearData: function () {
        var timeWork = new Date();
        /**
         * Количество удаленных сессий
         * @type {number}
         */
        var usersClear = 0;
        /**
         * Количество сессий
         * @type {number}
         */
        var usersCount = Object.keys(session).length;

        for (var id in session) {
            // пользователь не онлайн, не заходил как 30 минут (MIN_30)
            if (session[id].lastVisit && !session[id].isOnline && +timeWork - session[id].lastVisit > MIN_30) {
                delete session[id];
                usersClear++;
            }
        }
        log(__filename, 'auto clear data: ' + usersClear + '/' + (usersCount - usersClear));

        timeWork.setHours(timeWork.getHours() + 1);
        mvc['fw']['deferredFunction'].control.addFunction(+timeWork, function () {
            this.autoClearData();
        }, this);
    }
};

exports.control = control;
