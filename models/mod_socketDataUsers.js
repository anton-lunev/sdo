'use strict';
/**
 ** Файл: ./models/mod_socketDataUsers.js
 ** Тип: Модель
 ** Описание: Сценарий отвечает за хранение, поиск, получение и создание пользователей а так же их координат в игре
 ** Объект: mvc['models']['sessionDataUsers']
 **/
var mvc = require('../config/require.js');

var dataUsers = {};
/* пример:
 dataUsers = {
 'id-id-id': {
 session: 'player1'
 }
 }
 * Создается в control.setData
 */

var control = {
    /**
     * Создание объекта сокета
     * @param {String} id индетификатор сокета
     * @param {Object} data данные
     * @param {string} data.session интентификатор сессии
     * @returns {boolean}
     */
    setData: function (id, data) {
        if (typeof id != 'String' && typeof data != 'object' && !data.session) {
            return false;
        }

        dataUsers[id] = {
            session: data.session
        };

        log(__filename, 'setData info:', data);
    },

    /**
     * Получение объекта сокета по ее идентификатору
     * @param {String} id
     * @returns {Object}
     */
    getData: function (id) {
        if (!dataUsers.hasOwnProperty(id)) {
            return false;
        }

        if (this.callback)
            this.callback();

        return dataUsers[id];
    },

    /**
     * Получение объекта сессии по идентификатору сокета
     * @param {String} id
     * @returns {*}
     */
    getDataSession: function (id) {
        if (!dataUsers.hasOwnProperty(id)) {
            return false;
        }

        var session = mvc['models']['session'].control.getData(dataUsers[id].session);

        if (this.callback)
            this.callback();

        return session;
    },

    /**
     * Удаление объекта с идентификатором id
     * @param {String} id
     */
    removeData: function (id) {
        if (dataUsers.hasOwnProperty(id)) {
            delete dataUsers[id];
        }
    }

};

exports.control = control;