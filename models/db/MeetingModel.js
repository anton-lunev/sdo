// load the things we need
var mongoose = require('mongoose');

// define the schema for our meeting model
var meetingSchema = mongoose.Schema({

}, {strict: 'throw', collection: "meetings"});

//
// Common fields
//------------------------------------

//
// id
//
// идентификатор встречи
//
meetingSchema.add({

    id: {
        type: String
    }
});

//
// peopleOnline
//
// людишки online (хранятся id сессий)
//
meetingSchema.add({

    peopleOnline: {
        woman: [String],
        man: [String]
    }
});

//
// peopleSignedUp
//
// людишки которые заранее записались (здесь id это ВК id)
//
meetingSchema.add({

    peopleSignedUp: {
        woman: [Number],
        man: [Number]
    }
});

//
// maxPeople
//
// максимальное кол-во игроков
// @default: 20
//
meetingSchema.add({

    maxPeople: {
        type: Number,
        'default': 20
    }
});

//
// minPeople
//
// мин кол-во игроков
// @default: 20
//
meetingSchema.add({

    minPeople: {
        type: Number,
        'default': 10
    }
});

//
// city
//
// идентификатор города
//
meetingSchema.add({

    city: {
        type: Number
    }
});

//
// minAge
//
// минимальный возраст
//
meetingSchema.add({

    minAge: {
        type: Number,
        'default': 20
    }
});

//
// maxAge
//
// максимальный возраст
//
meetingSchema.add({

    maxAge: {
        type: Number,
        'default': 30
    }
});

//
// price
//
// цена
//
meetingSchema.add({

    price: {
        type: Number,
        required: true
    }
});

//
// timeStart
//
// время начала всчтечи
// @default: сегодня в 20:00
//
meetingSchema.add({

    timeStart: {
        type: Date,
        'default': function () {
            var now = new Date();
            return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate(), 23, 0, 0);
        }
    }
});

//
// signTime
//
// вход в комнату за n минут
//
meetingSchema.add({

    signTime: {
        type: Number,
        'default': 600
    }
});

//
// timeOneMeeting
//
// todo: коммент
//
meetingSchema.add({

    timeOneMeeting: {
        type: Number
    }
});

//
// freeSignTime
//
// todo: коммент
//
meetingSchema.add({

    freeSignTime: {
        type: Number
    }
});

//
// item_product
//
// todo: коммент
//
meetingSchema.add({

    item_product: {
        type: String
    }
});




//
// Static Methods
//------------------------------------
/**
 * Обновляет поля пользователя
 * @param {string} id - идентификатор пользователя
 * @param {string} field - название поля
 * @param {*} value - значение поля
 * @param {function} [callback] - callback метод
 */
meetingSchema.statics.setMeetingField = function (id, field, value, callback) {
    var updateData = {};
    updateData[field] = value;

    return this.update({id: id }, {$set: updateData}, {multi: false}, function (err) {
        if (err) console.log(err);

        if (typeof callback === 'function') {
            callback();
        }
    });
};

// create the model for meetings and expose it to our app
module.exports = mongoose.model('Meeting', meetingSchema);
