'use strict';
/**
 ** Файл: ./controllers/ctrl_routerSocket.js
 ** Тип: Контроллер
 ** Описание: Сценарий задействует нужные функции и отвечает клиенту (Socket.io)
 **/
var mvc = require('../config/require.js');

var socket = {
    /** Авторизация сокета
     **
     ** Происходит при соединении клиента к серверу (handshake)
     ** Отдает ответы
     **   1 - успешное подключение
     **   2 - запущена вторая копия
     **   3 - сессия не найдена
     **
     **/
    authorization: function (data) {
        // указана платформа и данные из соц сети
        if (!data.hasOwnProperty('platform') || !data.hasOwnProperty('data'))
            return;

        // todo вынести авторизацию в authorization.js
        var authorization;
        if (data.platform == 'vk') {
            authorization = mvc['models']['authorization'].control.authorizationInVk;
        }
        else {
            console.log('only vk');
            return false;
        }

        authorization(data.data, function (session) {
            // если сессия существует
            if (session) {
                // если объект сокета существует
                if (session.socketId && mvc['models']['socketDataUsers'].control.getData(session.socketId) && !data.data.closeAnotherTab) {
                    this.emit('authorization', {
                        response: 2
                    });
                }
                // объект сокета не существует
                else {
                    if (data.data.closeAnotherTab) {
                        this.to(session.socketId).emit('action', {name: 'closeTab', result: true});
                        mvc['models']['socketDataUsers'].control.removeData(session.socketId);
                    }
                    session.socketId = this.id; // сообщаем сессии новый socket id
                    session.isOnline = true;
                    mvc['models']['socketDataUsers'].control.setData(this.id, {
                        session: session.sessionId
                    }); // создаем новый объект сокета

                    this.emit('authorization', {
                        response: 1,
                        sex: session.sex
                    });

                    mvc['models']['meetingsController'].control.getUserStatus(session, this);
                }
            }
            // сессия не существует
            else {
                this.emit('authorization', {
                    response: 3
                });
            }
        }.bind(this), function (errorCode) {
            this.emit('meetingsController', { //todo SOCKET_EVENT_MEETINGS_CONTROLLER
                status: -1,
                codeErr: errorCode
            });
        }.bind(this));
    },

    /** Разъединение сокета
     **
     ** Происходит при перезагрузке страницы или ее закрытии со стороны клиента
     **
     **/
    disconnect: function () {
        /* порядок обязателен */

        var session = mvc['models']['socketDataUsers'].control.getDataSession(this.id);
        if (!session) {
            return
        }
        session.isOnline = false;
        session.lastVisit = Date.now();
        mvc['models']['meetingsController'].control.removeUser(session, this);

        //socket.rooms.call(this, { // покинуть комнату
        //    type: 'leave'
        //});
        mvc['models']['socketDataUsers'].control.removeData(this.id); // удалить из объектов пользователей
        // models.session.control.getData(data.cookie);
    },

    /**
     * Действия пользователя
     * @param {Object} data
     * @param {string} data.name название действия
     * @param {string} data.result результат действия
     */
    action: function (data) {
        if (!data || !data.name) {
            return;
        }

        var session = mvc['models']['socketDataUsers'].control.getDataSession(this.id);

        switch (data.name) {
            // отправил симпатию
            case 'sympathy':
                if (data.result) mvc['models']['meetingRooms'].control.setAddSympathy(session);
                break;
            // бесплатно зашел на встречу
            case 'freeRegister':
                mvc['models']['meetings'].control.setFreeRegister(session, this);
                break;
            // сообщение в чат
            case 'message':
                if (data.result) mvc['models']['messenger'].control.setMessage(session, data.result);
                break;
            // сообщение в чат
            case 'getStatus':
                mvc['models']['meetingsController'].control.getUserStatus(session, this);
                break;
            // сообщение в чат
            case 'lifehack:addMeeting':
                if (data.option)
                    mvc['models']['meetings'].control.addMeeting(data.option, data.isSave);
                break;
            // сообщение в чат
            case 'lifehack:addSignUp':
                mvc['models']['meetings'].control.setSignUpMeeting(session);
                break;
        }
    }
};

exports.socket = socket;
