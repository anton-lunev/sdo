'use strict';
/** todo переписать
 ** Файл: ./models/mod_meetingsController.js
 ** Тип: Модель
 ** Описание:
 ** Объект: mvc['models']['meetingsController']
 **/
var mvc = require('../config/require.js');

var SOCKET_EVENT_MEETINGS_CONTROLLER = 'meetingsController';

exports.control = {
    /**
     *
     * @param session
     * @param thisSocket
     */
    getUserStatus: function (session, thisSocket) {
        // todo посмотреть, нет ли чела в какой-либо комнате

        ///// ищем для человека встречи

        var meeting = mvc['models']['meetings'].control.getUserCorrectMeeting(session);

        // нету встреч
        if (!meeting) {
            thisSocket.emit(SOCKET_EVENT_MEETINGS_CONTROLLER, {
                status: -1,
                codeErr: 1
            });

            return;
        }

        // добавляем пользователя в комнату
        thisSocket.join(meeting.id);

        var freeRegister = meeting.timeStart - meeting.freeSignTime < Date.now();

        var isLockedSex = mvc['models']['meetings'].control.isLockedSexMeeting(meeting) === session.sex;

        var options = {
            yearsMin: meeting.minAge,
            yearsMax: meeting.maxAge,
            price: meeting.price,
            cityName: encodeURIComponent(session.cityName),
            timeStart: +meeting.timeStart,
            timeServer: Date.now(),
            freeSignTime: meeting.freeSignTime,
            isLockedSex: isLockedSex,
            isSigned: mvc['models']['meetings'].control.isSignUpMeeting(meeting, session),
            freeRegister: freeRegister || session.freeRegister
        };

        thisSocket.emit(SOCKET_EVENT_MEETINGS_CONTROLLER, {
            status: 1,
            data: options
        });


        // если чел уже зарегился, кидаем его в комнату
        if (options.isSigned) {
            mvc['models']['meetings'].control.joinMeetingsOnlineRoom(meeting, session)
        }


    },

    /**
     *
     * @param session
     * @param thisSocket
     */
    removeUser: function (session, thisSocket) {
        var meeting = mvc['models']['meetings'].control.getMeeting(null, session);
        mvc['models']['meetings'].control.leaveMeetingsOnlineRoom(meeting, session);

        if (meeting){
            thisSocket.leave(meeting.id);
        }
    }
};
