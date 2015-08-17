'use strict';
// load the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define the schema for our meeting model
var roomSchema = mongoose.Schema({

}, {strict: 'throw', collection: "rooms"});

//
// Common fields
//------------------------------------

//
// id
//
// идентификатор комнаты
//
roomSchema.add({

    id: {
        type: String
    }
});

//
// man
//
// массив идентификаторов мужчин
//
roomSchema.add({

    man: [
        {type: Schema.Types.ObjectId, ref: 'Users' }
    ]
});

//
// woman
//
// массив идентификаторов женщин
//
roomSchema.add({

    woman: [
        {type: Schema.Types.ObjectId, ref: 'Users' }
    ]
});

//
// offset
//
// смещение
//
roomSchema.add({

    offsetAction: {
        type: Number
    }
});

//
// timeStart
//
// время начала
//
roomSchema.add({

    timeStart: {
        type: Date,
        'default': Date.now
    }
});

//
// timeMeeting
//
// время общения в миллисекундах
//
roomSchema.add({

    timeMeeting: {
        type: Number
    }
});

//
// timePause
//
// время
//
roomSchema.add({

    timePause: {
        type: Number
    }
});

//
// sympathies
//
// симпатии
//
roomSchema.add({

    sympathies: {
        type: Object
    }
});









//
// Virtual fields
//------------------------------------





//
// Static Methods
//------------------------------------

/**
 * Создаем новую комнату
 * @param {Object} roomsData  - массив данных комнат
 * @param {Function} callback - callback метод
 */
roomSchema.statics.createRooms = function (roomsData, callback) {

    // Создаем комнаты в БД
    return this.create(roomsData, function (err, rooms) {
        if (err) return callback(err);

        rooms = rooms.map(function (room) {
            return room.toJSON({virtuals: true});
        });

        return callback(null, rooms);
    });
};

/**
 * Обновляет комнату или создает новую, если не существует
 * @param {id} id - идентификатор комнаты
 * @param {Object} data - данные комнаты
 * @param {Function} callback - callback метод
 */
roomSchema.statics.updateRoom = function (id, data, callback) {

    // Условия поиска
    var conditions = {
        id: id
    };

    // Конфиг
    var options = {
        upsert: true,
        'new': true
    };

    return this.findOneAndUpdate(conditions, {$set: data}, options, callback);
};

/**
 * Обновляет поля комнаты
 * @param {string} id - идентификатор комнаты
 * @param {string} field - название поля
 * @param {*} value - значение поля
 * @param {function} [callback] - callback метод
 */
roomSchema.statics.setRoomField = function (id, field, value, callback) {
    var updateData = {};
    updateData[field] = value;

    return this.update({_id: id }, {$set: updateData}, {multi: false}, callback);
};



// create the model for meetings and expose it to our app
module.exports = mongoose.model('Rooms', roomSchema);
