'use strict';

//todo переписать все нах!!

var mvc = require('../config/require.js');

var Math = mvc['modules']['math'];

var rooms = {};

var control = {
    // создание комнат
    createRooms: function (meeting) {
        console.log('meeting info: ' + JSON.stringify(meeting, null, 2));

        // Комната пустая - закрываем
        if (!meeting.peopleOnline.man.length && !meeting.peopleOnline.woman.length) {
            console.log('no users in meeting ' + meeting.id);
            return;
        }

        // нету парней
        if (!meeting.peopleOnline.man.length) {
            console.log('no man in meeting ' + meeting.id);
            mvc['models']['meetings'].control.setFreeRegisters(meeting, meeting.peopleOnline.woman);
            return;
        }

        // нету девушек
        if (!meeting.peopleOnline.woman.length) {
            console.log('no women in meeting ' + meeting.id);
            mvc['models']['meetings'].control.setFreeRegisters(meeting, meeting.peopleOnline.man);
            return;
        }

        // мало народу
        if (meeting.peopleOnline.woman.length + meeting.peopleOnline.man.length < meeting.minPeople) {
            console.log('few people in meeting ' + meeting.id);
            mvc['models']['meetings'].control.setFreeRegisters(meeting, meeting.peopleOnline.man.concat(meeting.peopleOnline.woman));
            return;
        }

        // если парней в 2 раза больше девушек
        var division;
        if (meeting.peopleOnline.man.length > meeting.peopleOnline.woman.length * 2) {
            // сколько человек будет исключено
            division = meeting.peopleOnline.man.length - meeting.peopleOnline.woman.length * 2;

            mvc['models']['meetings'].control.setFreeRegisters(meeting, meeting.peopleOnline.man.slice(division));
            meeting.peopleOnline.man = meeting.peopleOnline.man.slice(0, division);
        }

        // если девушек в 2 раза больше девушек
        if (meeting.peopleOnline.woman.length > meeting.peopleOnline.man.length * 2) {
            // сколько человек будет исключено
            division = meeting.peopleOnline.woman.length - meeting.peopleOnline.man.length * 2;

            mvc['models']['meetings'].control.setFreeRegisters(meeting, meeting.peopleOnline.woman.slice(division));
            meeting.peopleOnline.woman = meeting.peopleOnline.woman.slice(0, division);
        }
        console.log('>>>>>>>>>> create room', meeting.peopleOnline); // todo delete
        var peopleMan = this.usersBalance(meeting.peopleOnline.man, meeting.peopleOnline.woman);
        var peopleWoman = this.usersBalance(meeting.peopleOnline.woman, meeting.peopleOnline.man);
        console.log('>>>>>>>>>> man:', peopleMan); // todo delete
        console.log('>>>>>>>>>> woman:', peopleWoman); // todo delete
        // среднее количество человек которые поместятся в комнату
        var averagePeopleInRoom = Math.round((meeting.maxPeople + meeting.minPeople) / 2);

        // количество комнат
        var numberRooms = Math.round(peopleMan.length / averagePeopleInRoom) || 1;

        var roomsPeople = this.roomsPeople(peopleMan, peopleWoman, numberRooms);

        console.log('>>>>>>>>>> roomsPeople:', roomsPeople); // todo delete

        var timeStart = Date.now();

        roomsPeople = roomsPeople.map(function (roomPeople, key) {
            return {
                id: meeting.id + key,
                man: roomPeople[1], //todo хранить сразу сессии чувачков
                woman: roomPeople[0],
                offsetAction: 0,
                timeStart: timeStart,
                timeMeeting: meeting.timeOneMeeting,
                timePause: 15 * 1000,
                sympathies: {}
            };
        });

        // Создаем комнаты в ДБ ...
        mvc['models']['dbRoomModel'].createRooms(roomsPeople, function (err, resRooms) {
            if (err) throw err; //todo: обработать ошибку
        });

        // ... и не дожидаясь ответа добавляем каждую комнату
        roomsPeople.forEach(function (room) {
            this.startRoom(rooms[room.id] = room);
        }.bind(this));
    },

    /**
     * Сложная штука уравнивает кол-во пользователей
     * @param {Array} a список пользователей одного пола
     * @param {Array} b список пользователей другого пола
     * @returns {Array}
     */
    usersBalance: function usersBalance(a, b) {
        // отдельный экземпляр
        a = a.slice();
        b = b.slice();

        if (a.length >= b.length) {
            return a;
        }

        var failUser = b.length - a.length;
        var positionFailUser = Math.round(b.length / failUser);

        for (var i = 1; i <= failUser; i++) {
            a.splice(positionFailUser * i, 0, null);
        }

        return a;
    },

    /**
     * Пиздец сложная штука, разбиваем массив пользователей на почти равные части
     * @param peopleMan
     * @param peopleWoman
     * @param len
     * @returns {Array}
     */
    roomsPeople: function (peopleMan, peopleWoman, len) {

        var lageNumRoom = peopleMan.length % len; // столько чел больших комнат
        var usersInRoom = Math.floor(peopleMan.length / len); //

        var roomPeople = [];

        var ii = 0;
        for (var i = 0; i < len; i++) {
            // сколько человек в данной комнате
            var count = usersInRoom;
            if (lageNumRoom) {
                count++;
                lageNumRoom--;
            }

            roomPeople.push({
                0: peopleWoman.slice(ii, ii + count),
                1: peopleMan.slice(ii, ii + count)
            });

            ii += count;
        }


        return roomPeople;
    },

    /**
     * Получает сессию из массива по ключу (по кругу)
     * @param users
     * @param key
     * @param offsetAction
     * @returns {*|string}
     */
    getSessionUserInArray: function (users, key, offsetAction) {
        if (offsetAction >= users.length || offsetAction <= -users.length) {
            return null;
        }

        key += offsetAction;
        if (key >= users.length) {
            key -= users.length;
        }

        if (key < 0) {
            key += users.length;
        }

        return mvc['models']['session'].control.getData(users[key]);

    },
    /*getSessionUserInArrayTest: function (users, key, offsetAction) {
        if (offsetAction >= users.length || offsetAction <= -users.length) {
            return null;
        }

        key += offsetAction;
        if (key >= users.length) {
            key -= users.length;
        }

        if (key < 0) {
            key += users.length;
        }

        return users[key];

    },*/

    /**
     * Создание комнаты. Другими словами - рекурсивное создание встреч.
     * @param {Object} room
     */
    startRoom: function (room) {
        // В комнате прошли все встречи, отдаем симпатии
        if (room.offsetAction >= room.man.length) {
            console.log('stop and close room ' + room.id);
            return this.sendSympathyUsersInRoom(room, function () {
                this.closeRoom(room);
            }.bind(this));
        }

        // последняя итерация
        var lastIteration = room.offsetAction + 1 >= room.man.length;
        var preLastIteration = room.offsetAction + 2 >= room.man.length;

        var oneMeeting = room.timePause + room.timeMeeting;
        var timeOffsetAction = room.offsetAction * oneMeeting;

        for (var keyUser in room.man) {

            var userMan = this.getSessionUserInArray(room.man, +keyUser, 0);
            var userWoman = this.getSessionUserInArray(room.woman, +keyUser, room.offsetAction);

            // след мужик для девушки (обратный порядок)
            var nextUserMan = (!lastIteration) ? this.getSessionUserInArray(room.man, +keyUser, -1) : null;
            var timeNextUserMan = +room.timeStart + timeOffsetAction + oneMeeting;
            // сложна штука, если след пользователь null
            if (!nextUserMan && !preLastIteration) {
                nextUserMan = this.getSessionUserInArray(room.man, +keyUser, -2);
                timeNextUserMan = +room.timeStart + timeOffsetAction + oneMeeting * 2;
            }

            // след девушка для мужика (простое смещение)
            var nextUserWoman = (!lastIteration) ? this.getSessionUserInArray(room.woman, +keyUser, room.offsetAction + 1) : null;
            var timeNextUserWoman = +room.timeStart + timeOffsetAction + oneMeeting;
            // сложна штука, если след пользователь null
            if (!nextUserWoman && !preLastIteration) {
                nextUserWoman = this.getSessionUserInArray(room.woman, +keyUser, room.offsetAction + 2);
                timeNextUserWoman = +room.timeStart + timeOffsetAction + oneMeeting * 2;
            }

            console.log('>>>>>>>> userMan/userWoman', userMan.name, '/', userWoman.name); //todo delete
            console.log('>>>>>>>>>> ', userWoman.name, 'nextUserMan:', (nextUserMan) ? nextUserMan.name : null);
            console.log('>>>>>>>>>> ', userMan.name, 'nextUserMan:', (nextUserWoman) ? nextUserWoman.name : null);
            console.log('>>>>>>>>>> keyUser', keyUser, room.offsetAction);
            if (userMan) {
                userMan.roomId = room.id;
                userMan.partner = (userWoman) ? userWoman.id : null; // todo хранить не в сессии
            }
            if (userWoman) {
                userWoman.roomId = room.id;
                userWoman.partner = ( userMan) ? userMan.id : null; // todo хранить не в сессии
            }

            if (userMan && userMan.isOnline) mvc['modules']['socket'].to(userMan.socketId).emit('meetingsController', {
                status: 2,
                data: {
                    currentUser: (!userWoman) ? null : {
                        name: userWoman.name,
                        age: userWoman.age,
                        photo: userWoman.photo,
                        timeEnd: +room.timeStart + timeOffsetAction + room.timeMeeting
                    },
                    nextUser: (!nextUserWoman) ? null : {
                        name: nextUserWoman.name,
                        age: nextUserWoman.age,
                        photo: nextUserWoman.photo,
                        timeStart: timeNextUserWoman
                    },
                    timeServer: Date.now(),
                    queue: room.man - room.offsetAction
                }
            }); // todo константы

            if (userWoman && userWoman.isOnline) mvc['modules']['socket'].to(userWoman.socketId).emit('meetingsController', {
                status: 2,
                data: {
                    currentUser: (!userMan) ? null : {
                        name: userMan.name,
                        age: userMan.age,
                        photo: userMan.photo,
                        timeEnd: +room.timeStart + timeOffsetAction + room.timeMeeting
                    },
                    nextUser: (!nextUserMan) ? null : {
                        name: nextUserMan.name,
                        age: nextUserMan.age,
                        photo: nextUserMan.photo,
                        timeStart: timeNextUserMan
                    },
                    timeServer: Date.now(),
                    queue: room.man - room.offsetAction
                }
            });
        }
        console.log('>>>>>>>> room.offsetAction', room.offsetAction); //todo delete
        room.offsetAction++;
        mvc['fw']['deferredFunction'].control.addFunction(+room.timeStart + timeOffsetAction + oneMeeting, function () {
            this.startRoom(room);
        }, this);
    },
/*
    testRoom: function(room) {
        if (room.offsetAction >= room.man.length) {
            console.log('stop test room ');
            return;
        }
        console.log('>> start test room <<');
        var lastIteration = room.offsetAction + 1 >= room.man.length;
        var preLastIteration = room.offsetAction + 2 >= room.man.length;

        var oneMeeting = room.timePause + room.timeMeeting;
        var timeOffsetAction = room.offsetAction * oneMeeting;




        for (var keyUser in room.man) {

            var userMan = this.getSessionUserInArrayTest(room.man, +keyUser, 0);
            var userWoman = this.getSessionUserInArrayTest(room.woman, +keyUser, room.offsetAction);

            // след мужик для девушки (обратный порядок)
            var nextUserMan = (!lastIteration) ? this.getSessionUserInArrayTest(room.man, +keyUser, -1) : null;
            var timeNextUserMan = +room.timeStart + timeOffsetAction + oneMeeting;
            // сложна штука, если след пользователь null
            if (!nextUserMan && !preLastIteration) {
                nextUserMan = this.getSessionUserInArrayTest(room.man, +keyUser, -2);
                timeNextUserMan = +room.timeStart + timeOffsetAction + oneMeeting * 2;
            }

            // след девушка для мужика (простое смещение)
            var nextUserWoman = (!lastIteration) ? this.getSessionUserInArrayTest(room.woman, +keyUser, room.offsetAction + 1) : null;
            var timeNextUserWoman = +room.timeStart + timeOffsetAction + oneMeeting;
            // сложна штука, если след пользователь null
            if (!nextUserWoman && !preLastIteration) {
                nextUserWoman = this.getSessionUserInArrayTest(room.woman, +keyUser, room.offsetAction + 2);
                timeNextUserWoman = +room.timeStart + timeOffsetAction + oneMeeting * 2;
            }

            console.log('>>>>>>>> userMan/userWoman', userMan, '/', userWoman); //todo delete
            console.log('>>>>>>>>>> ', userWoman, 'nextUserMan:', (nextUserMan) ? nextUserMan : null);
            console.log('>>>>>>>>>> keyUser', keyUser, room.offsetAction);

        }
        console.log('>>>>>>>> room.offsetAction', room.offsetAction); //todo delete

        console.log();
        console.log();
        room.offsetAction++;
        this.testRoom(room);
    },*/

    /**
     *
     * @param room
     * @param callback
     */
    sendSympathyUsersInRoom: function (room, callback) {
        var users = room.man.concat(room.woman);
        for (var userId in users) {

            var session = mvc['models']['session'].control.getData(users[userId]);
            if (!session) {
                continue;
            }

            //todo проверять на существовании, вдруг кто-то вышел. Может вылететь исключение
            mvc['modules']['socket'].to(session.socketId).emit('meetingsController', {
                status: 3,
                data: this.searchSympathy(session, room)
            });
        }

        if (callback) {
            callback();
        }
    },

    /**
     * Удаление комнаты
     */
    closeRoom: function (room) {
        //todo:Artem сохранить на всякий случай в бд и callback'ом удалить
        delete rooms[room.id];
    },
    /**
     * Комната по ее номеру
     * @param {String|null} roomId Номер комнаты
     * @param {Object} session Сессия пользователя
     * @returns {Object}
     */
    getRoomForId: function (roomId, session) {
        if (!roomId) {
            roomId = session.roomId;
        }

        return rooms[roomId];
    },

    /**
     * Поиск текущего партнера в комнате
     * @param {Object} session
     * @param {Object} room
     * @returns {*}
     */
    getPartnerIdInRoom: function (session, room) {
        return session.partner; //todo брать из комнаты
    },

    /**
     * Пользователь отправил симпатию
     * @param {Object} session
     */
    setAddSympathy: function (session) {
        var room = this.getRoomForId(null, session);
        if (!room) {
            console.log('not found room in mod_meetingRoom.js > setAddSympathy ' + session.id);
            return;
        }

        var partnerId = this.getPartnerIdInRoom(session, room);

        (room.sympathies.hasOwnProperty(session.id))
            ? room.sympathies[session.id].push(partnerId)
            : room.sympathies[session.id] = [partnerId];

        // todo:Artem обновить комнату в дб
    },

    /**
     * Взаимные симпатии для пользователя
     * @param {Object} session Номер сессии пользователя
     * @param room
     * @returns {Array} Имя, фото и id vk
     */
    searchSympathy: function (session, room) {
        //todo может сразу передавать id? Или лучше сразу с сессией работать? надежнее!?
        var sessionId = session.id;
        //var room = this.getRoomForId(room, session);

        if (session.freeRegister) {
            mvc['models']['session'].control.setData(sessionId, 'freeRegister', false);
        }

        if (!room.sympathies[sessionId]) {
            return [];
        }

        var sympathySessions = [];
        // наши симпатии
        for (var i = 0; i < room.sympathies[sessionId].length; i++) {
            // симпатии партнера
            var partnerSympathy = room.sympathies[room.sympathies[sessionId][i]];
            // если взаимная симпатия
            if (partnerSympathy && partnerSympathy.indexOf(sessionId) + 1) {
                var sessionUser = mvc['models']['session'].control.getData(room.sympathies[sessionId][i]);
                sympathySessions.push({
                    name: sessionUser.name,
                    photo: sessionUser.photo,
                    age: sessionUser.age,
                    viewer_id: sessionUser.viewer_id
                });
            }
        }
        return sympathySessions;
    }
};

exports.control = control;

