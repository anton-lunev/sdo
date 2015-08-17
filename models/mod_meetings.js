'use strict';
/** todo переписать
 ** Файл: ./models/mod_meetings.js
 ** Тип: Модель
 ** Описание: Сценарий отвечает за хранение и обновление игровых комнат
 ** Объект: mvc['models']['meetings']
 **/
var mvc = require('../config/require.js');

var meetings = {};

var control = {
    /**
     * Добавление встречи
     * @param {Object} option опции встречи
     * @param {String} option.id номер встречи
     * @param {number} option.city номер города
     * @param {number} option.timeStart время начала
     * @param {number} [option.maxPeople] максимум человек в комнату
     * @param {number} [option.minPeople] минимум человек в комнату
     * @param {number} [option.minAge] минимальный возраст
     * @param {number} [option.maxAge] максимальный возраст
     * @param {number} [option.item_product] номер прайса
     * @param {number} [option.freeSignTime] время бесплатной регистрации
     * @param {number} [option.timeOneMeeting] время общения
     * @param {boolean} [isSave] сохранение в бд
     */
    addMeeting: function (option, isSave) {
        if (!option || !option.id || !option.city || !option.timeStart) {
            console.log('meeting not add; fail options');
        }

        if (typeof option.timeStart != 'object') {
            option.timeStart = new Date(option.timeStart);
        }

        var item_product = option.item_product || 'subscribe_default';
        var product = mvc['config']['settings'].conf.products[item_product];
        if (!product) {
            console.log('meeting not add; fail product');
            return;
        }

        meetings[option.id] = {
            id: option.id,
            peopleOnline: { // людишки online (хранятся id сессий)
                woman: [], //todo саму сессию хранить надо бы (с) Йода
                man: []
            },
            peopleSignedUp: option.peopleSignedUp || { // людишки которые заранее записались
                woman: [],
                man: []
            },
            minPeople: option.minPeople || 6,
            maxPeople: option.maxPeople || 12,
            city: option.city,
            minAge: option.minAge || 18,
            maxAge: option.maxAge || 50,
            price: product.price, // цена
            item_product: item_product,
            timeStart: option.timeStart,
            freeSignTime: option.freeSignTime || 30 * 60 * 1000, // 30 минут
            timeOneMeeting: option.timeOneMeeting || 3 * 60 * 1000 // 3 мин
        };

        // сохранить в бд
        if (isSave) {
            mvc["models"]["dbMeetingModel"].create(meetings[option.id], function (err, meeting) {
                if (err) console.error(err); //todo: пока логируем ошибку в консоль
            });
        }

        // Начало бесплатной записи
        mvc['fw']['deferredFunction'].control.addFunction(+option.timeStart - option.freeSignTime, function () {
            console.log('meeting ' + option.id + ' free sign time');

            mvc['modules']['socket'].sockets.in(option.id).emit('action', {
                name: 'editFreeSignTime',
                result: true
            });
        }, this);

        // Начало встречи
        mvc['fw']['deferredFunction'].control.addFunction(+option.timeStart, function () {

            if (!meetings[option.id]) {
                log(__filename, 'meeting ' + option.id + ' not started');
                console.log('option:', option);
                console.log('meetings:', meetings);
                return;
            }
            // начало встречи
            mvc['models']['meetingRooms'].control.createRooms(meetings[option.id]);

            // создание следующей встречи
            var timeMeeting = new Date(
                option.timeStart.getFullYear(),
                option.timeStart.getMonth(),
                option.timeStart.getDate() + 1,
                0,
                0,
                72000
            );

            control.addMeeting({
                id: timeMeeting.toJSON() + 'city' + option.city + 'age' + option.minAge + '-' + option.maxAge,
                minPeople: option.minPeople,
                maxPeople: option.maxPeople,
                city: option.city,
                minAge: option.minAge,
                maxAge: option.maxAge,
                price: product.price, // цена
                item_product: item_product,
                timeStart: timeMeeting,
                freeSignTime: option.freeSignTime,
                timeOneMeeting: option.timeOneMeeting
            }, true);
        }, this);

        // Оповещение о начале встречи за 5 мин.
        mvc['fw']['deferredFunction'].control.addFunction(+option.timeStart - 3 * 60 * 1000, function () {

            if (!meetings[option.id]) {
                log(__filename, 'meeting ' + option.id + ' not started');
                console.log('option:', option);
                console.log('meetings:', meetings);
                return;
            }

            // Формируем массив пользователей, записавшихся на встречу
            var meeting = meetings[option.id],
                users = meeting.peopleSignedUp.woman.concat(meeting.peopleSignedUp.man);

            // Отправляем пользователям уведомление о начале встречи
            mvc['models']['vk'].control.sendMeetingNotify(users, 'Начинаем через 3 минуты. Присоединяйтесь!');

        }, this);

        // Оповещение о начале встречи за 15 мин.
        mvc['fw']['deferredFunction'].control.addFunction(+option.timeStart - 15 * 60 * 1000, function () {

            if (!meetings[option.id]) {
                log(__filename, 'meeting ' + option.id + ' not started');
                console.log('option:', option);
                console.log('meetings:', meetings);
                return;
            }

            // Формируем массив пользователей, записавшихся на встречу
            var meeting = meetings[option.id],
                users = meeting.peopleSignedUp.woman.concat(meeting.peopleSignedUp.man);

            // Отправляем пользователям уведомление о начале встречи
            mvc['models']['vk'].control.sendMeetingNotify(users, 'Начало встречи через 15мин. Заходите!');

        }, this);

        // Оповещение о начале встречи за 5 часов.
        mvc['fw']['deferredFunction'].control.addFunction(+option.timeStart - 4 * 60 * 60 * 1000, function () {

            if (!meetings[option.id]) {
                log(__filename, 'meeting ' + option.id + ' not started');
                console.log('option:', option);
                console.log('meetings:', meetings);
                return;
            }

            // Формируем массив пользователей, записавшихся на встречу
            var meeting = meetings[option.id],
                users = meeting.peopleSignedUp.woman.concat(meeting.peopleSignedUp.man);

            // Отправляем пользователям уведомление о начале встречи
            //TODO Ставить время из переменной option.timeStart
            mvc['models']['vk'].control.sendMeetingNotify(users, 'Встреча начнется в 20:00. Не пропустите!');

        }, this);
    },

    /** getRooms()
     **
     ** Отдает ссылку на объект с комнатами (var meetings)
     **/
    getMeetings: function () {
        return meetings;
    },

    /**
     * Подбирает актуальную (ближайшую) встречу
     * @param session
     * @returns {false|Object}
     */
    getCorrectMeeting: function (session) {
        var meeting;
        for (var key in meetings) {
            if (this.isCorrectMeeting(meetings[key], session)) {
                meeting = meetings[key];
                break;
            }
        }

        return meeting || false;
    },

    /**
     * Подходит ли пользователь под встречу
     * @param {string|Object} meeting
     * @param {Object} session
     * @returns {boolean}
     */
    isCorrectMeeting: function (meeting, session) {
        var age = session.age;

        meeting = this.getMeeting(meeting, session);

        if (!meeting) {
            return false;
        }

        // встреча устарела
        var now = new Date();
        if (+meeting.timeStart < +now) {

            // встреча очень устарела
            now.setHours(now.getHours() - 3);
            if (+meeting.timeStart < +now) {
                this.closeMeeting(meeting.id);
            }
            return false;
        }

        if (meeting.city != session.cityId) {
            return false;
        }

        // если возраст не указан, то все равно встречу корректной
        if (!age) {
            return true;
        }

        return meeting.maxAge >= age && meeting.minAge <= age;
    },

    /**
     * Удаление встреч
     * @param meetingId
     */
    closeMeeting: function (meetingId) {
        // todo:Artem на всякий случай обновлять бд
        log(__filename, 'close meeting', meetingId);
        delete meetings[meetingId];
    },

    /**
     * Вовзращает актуальную будущую встречу
     * @param session
     */
    getUserCorrectMeeting: function (session) {
        // если он уже записался на какую-то встречу
        var meeting = this.getMeeting(null, session);
        if (meeting && !this.isCorrectMeeting(meeting, session)) {
            session.meetingId = null;
            meeting = false;
        }

        // если не нашли нужную встручу, попробуем ее подобрать
        if (!meeting) {
            meeting = this.getCorrectMeeting(session);

            // записываем пользователю id встречи
            if (meeting) {
                // сохраняем в сессию, заносим в бд
                mvc['models']['session'].control.setData(session.id, 'meetingId', meeting.id);
            }
        }

        return meeting;
    },

    /**
     * Записан ли пользователь на встречу?
     * @param meeting
     * @param session
     */
    isSignUpMeeting: function (meeting, session) {
        return !!(meeting.peopleSignedUp[(session.sex == 1) ? 'man' : 'woman'].indexOf(session.viewer_id) + 1);
    },

    /**
     * Записан ли пользователь на встречу?
     * @param meeting
     * @param session
     */
    isOnlineMeeting: function (meeting, session) {
        return !!(meeting.peopleOnline[(session.sex == 1) ? 'man' : 'woman'].indexOf(session.id) + 1);
    },

    /**
     * записать пользователя на встречу
     * @param session
     */
    setSignUpMeeting: function (session) {
        var meeting = this.getMeeting(null, session);
        if (!meeting) {
            return false;
        }

        var isLockedSexMeeting = this.isLockedSexMeeting(meeting);
        if (isLockedSexMeeting === session.sex) {
            return false;
        }

        // уже записан
        if (this.isSignUpMeeting(meeting, session)) {
            console.log('second bye!? session:' + session.id + ' meeting:' + meeting.id);
            return false;
        }

        // записали на встречу
        meeting.peopleSignedUp[(session.sex == 1) ? 'man' : 'woman'].push(session.viewer_id);
        //todo:Artem почему-то если я передаю meeting.peopleSignedUp, то монга его очищает
        mvc['models']['dbMeetingModel'].setMeetingField(meeting.id, 'peopleSignedUp', {
            man: meeting.peopleSignedUp.man.slice(),
            woman: meeting.peopleSignedUp.woman.slice()
        });

        // если после этой записи мы блокируем/разблокиреум пол пользователей, сообщаем это людям
        if (isLockedSexMeeting !== this.isLockedSexMeeting(meeting)) {
            var options = {
                name: 'editIsLockedSex',
                result: this.isLockedSexMeeting(meeting)
            };
            mvc['modules']['socket'].sockets.in(meeting.id).emit('action', options);
        }
        return true;
    },

    /**
     * Заблокирован ли данный пол пользователя для записи?
     * @param meeting
     */
    isLockedSexMeeting: function (meeting) {
        var lengthManSex = meeting.peopleSignedUp.man.length;
        var lengthWomanSex = meeting.peopleSignedUp.woman.length;

        // пользователей не надбралось до минимума
        if (lengthManSex + lengthWomanSex < meeting.minPeople) {
            return null;
        }

        // время халявной записи
        if (meeting.timeStart - meeting.freeSignTime < Date.now()) {
            var lengthOnlineManSex = meeting.peopleSignedUp.man.length;
            var lengthOnlineWomanSex = meeting.peopleSignedUp.woman.length;
            return (lengthOnlineManSex > lengthOnlineWomanSex) ? 1 : (lengthOnlineManSex < lengthOnlineWomanSex) ? 0 : null;
        }

        // отношение мужиков к не мужикам
        var division = lengthManSex / lengthWomanSex;

        // если одного пола не больше в два раза чем другого, тогда нет проблем
        if (division > 0.5 && division < 2) {
            return null;
        }

        // если кого-то больше в 2 раза чем другого, тогда отдаем пол который блокируем
        return (lengthManSex > lengthWomanSex) ? 1 : (lengthManSex < lengthWomanSex) ? 0 : null;
    },

    /**
     * Получение встречи по id
     * @param {String} [meetingId]
     * @param {String} [session]
     * @returns {false|Object}
     */
    getMeeting: function (meetingId, session) {
        // если мы уже передали встречу
        if (meetingId && typeof meetingId == 'object') {
            return meetingId;
        }

        // если не передали id встречи но передали сессию
        if (!meetingId && session) {
            meetingId = session.meetingId;
        }

        // если все таки нету id встречи или нету такой встречи вообще
        return meetings[meetingId] || false;
    },

    /** joinRoom(idRoom, idPlayer)
     **
     ** idRoom: индитификатор комнаты
     ** session: сессия пользователя
     **
     ** Вступить в комнату idRoom пользователю с session (для тех, кто уже записался)
     **/
    joinMeetingsOnlineRoom: function (meeting, session) {
        meeting = this.getMeeting(meeting, session);

        // комната не существует
        if (!meeting) {
            console.log('>> models >> meetings >> joinRoom >> user (id: ' + session.sessionId + '); not found room)');
            return false;
        }

        if (!this.isOnlineMeeting(meeting, session)) {
            meeting.peopleOnline[(session.sex == 1) ? 'man' : 'woman'].push(session.id);
        }
        else {
            console.log('>> models >> meetings >> joinRoom >> user (id: ' + session.id + ') already online');
        }

        return true;
    },
    /** leaveRoom(idPlayer)
     **
     **/
    leaveMeetingsOnlineRoom: function (meeting, session) {
        meeting = this.getMeeting(meeting, session);

        // комната не существует
        if (!meeting) {
            console.log('>> models >> meetings >> leaveRoom >> user (id: ' + session.sessionId + '); not found room');
            return false;
        }

        // удаление человека из списка комнаты
        if (this.isOnlineMeeting(meeting, session)) {
            var peopleOnlineArray = meeting.peopleOnline[(session.sex == 1) ? 'man' : 'woman'];
            peopleOnlineArray.splice(peopleOnlineArray.indexOf(session.id), 1);
        }

        return true;
    },

    /**
     * Пользователь хочет бесплатно записаться на стречу
     * @param session
     * @param thisSocket
     */
    setFreeRegister: function (session, thisSocket) {
        var meeting = this.getMeeting(null, session);
        if (!meeting) {
            console.log('not found room in mod_meetingRoom.js > setFreeRegister ' + session.id);
            return;
        }

        // и так записан
        if (this.isOnlineMeeting(meeting, session)) {
            thisSocket.emit('action', {name: 'editSignedUp', result: true});
            return
        }

        // сейчас не время бесплатной записи
        var now = Date.now();
        if (meeting.timeStart < now && meeting.timeStart - meeting.freeSignTime > now) {
            thisSocket.emit('action', {name: 'editSignedUp', result: false});
            return;
        }

        if (this.isLockedSexMeeting(meeting) == session.sex && !session.freeRegister) {
            thisSocket.emit('action', {name: 'editSignedUp', result: false});
        }

        // записали на встречу
        meeting.peopleOnline[(session.sex == 1) ? 'man' : 'woman'].push(session.id);

        // todo копипаста
        // сообщаем изменения всем не зарегеным пользователям
        mvc['modules']['socket'].sockets.in(meeting.id).emit('action', {
            name: 'editIsLockedSex',
            result: this.isLockedSexMeeting(meeting)
        });

        thisSocket.emit('action', {name: 'editSignedUp', result: true});
    },

    /**
     * Даем беслптную следующую встречу
     * @param meeting
     * @param userArray
     */
    setFreeRegisters: function (meeting, userArray) {
        for (var userId in userArray) {
            var session = mvc['models']['session'].control.getData(userArray[userId]);
            if (this.isSignUpMeeting(meeting, session)) { // записываем
                mvc['models']['session'].control.setData(session.id, 'freeRegister', true);
                mvc['modules']['socket'].to(session.socketId).emit('meetingsController', {status: -1, codeErr: 2});
            } else {
                mvc['modules']['socket'].to(session.socketId).emit('meetingsController', {status: -1, codeErr: 3});
            }
        }
    },

    /**
     * Загружает встречи из БД
     */
    loadDBMeetings: function () {
        var now = new Date();

        mvc["models"]["dbMeetingModel"].find({timeStart: {$gt: now}}, function (err, meetings) {
            if (err) throw err; // todo: обработать ошибку

            // Формируем все встречи
            meetings = meetings.map(function (meeting) {
                return meeting.toJSON({virtuals: true});
            });

            // Проходим по всем встречам и
            for (var i = 0, len = meetings.length; i < len; i++) {
                log(__filename, 'loading meeting ', meetings[i].id, meetings[i].peopleSignedUp);
                control.addMeeting(meetings[i], false);
            }
        });
    }
};

exports.control = control;
