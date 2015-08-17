// load the things we need
var mvc = require('../../config/require.js');
var mongoose = require('mongoose');

// define the schema for our user model
var userSchema = mongoose.Schema({

}, {strict: 'throw', collection: "users"});

//
// viewer_id
//
// Id пользователя в соц. платформе
//
userSchema.add({

    viewer_id: {
        type: Number
    }
});

//
// created_at
//
// дата регистрации пользователя (timestamp)
//
userSchema.add({

    created_at: {
        type: Number,
        'default': Date.now
    }
});

//
// first_name
//
// имя пользователя в соц. платформе
//
userSchema.add({

    first_name: {
        type: String
    }
});

//
// last_name
//
// фамилия пользователя в соц. платформе
//
userSchema.add({

    last_name: {
        type: String
    }
});

//
// sex
//
// пол пользователя в соц. платформе
//
userSchema.add({

    sex: {
        type: Number,
        enum: [0, 1]
    }
});

//
// bdate
//
// дата рождения пользователя в соц. платформе
//
userSchema.add({

    bdate: {
        type: String
    }
});

//
// city
//
// город пользователя в соц. платформе
//
userSchema.add({

    city: {
        id: Number,
        title: String
    }
});

//
// photo
//
// фото пользователя в соц. платформе
//
userSchema.add({

    photo: {
        type: String
    }
});

//
// roomId
//
// идентификатор комнаты
//
userSchema.add({

    roomId: {
        type: String
    }
});

//
// meetingId
//
// идентификатор сстречи
//
userSchema.add({

    meetingId: {
        type: String
    }
});

//
// freeRegister
//
// бесплатная встреча
//
userSchema.add({

    freeRegister: {
        type: Boolean,
        'default': false
    }
});

//
// isOnline
//
// пользователь онлайн
//
userSchema.add({

    isOnline: {
        type: Boolean,
        'default': false
    }
});




//
// Virtual fields
//------------------------------------

//
// id
//
// Alias для идентификатора пользователя
//
userSchema.virtual('id').get(function () {
    return this._id.toString();
});

//
// cityName
//
// Название города пользователя в соц. платформе
//
userSchema.virtual('cityName').get(function () {
    return this.city.title ;
});

//
// cityId
//
// Название города пользователя в соц. платформе
//
userSchema.virtual('cityId').get(function () {
    return this.city.id ;
});

//
// name
//
// Полное имя пользователя в соц. платформе
//
userSchema.virtual('name').get(function () {
    return [this.first_name, this.last_name].join(' ');
});

//
// sessionId
//
// Идентификатор сессия пользователя
//
userSchema.virtual('sessionId').get(function () {
    return this._id.toString();
});

//
// sessionId
//
// Идентификатор сессия пользователя
//
userSchema.virtual('age').get(function () {
    var bdate = (this.bdate || '').split('.');
    return mvc['fw']['user'].control.getAge(bdate[2], bdate[1], bdate[0]);
});




//
// Static Methods
//------------------------------------

/**
 * Возвращает пользователя по id соц. платформы или
 * создает нового, если еще не существует
 * @param {Object} userData  - данные пользователя в соц. платформе
 * @param {Function} callback - callback метод
 */
userSchema.statics.fetchUser = function (userData, callback) {
    var created_at = Date.now();

    // Условия поиска
    var conditions = {
        viewer_id: userData.id
    };

    // Данные для обновления пользователя
    var update = {
        viewer_id       : userData.id,
        first_name      : userData.first_name,
        last_name       : userData.last_name,
        sex             : (userData.sex == 2) ? 1 : (userData.sex == 1) ? 0 : null, // todo сли пола нету
        bdate           : userData.bdate,
        city            : userData.city,
        photo           : userData.photo_max_orig
    };

    // Данные для случая нового пользователя
    var setOnInsert = {
        created_at: created_at
    };

    // Конфиг
    var options = {
        upsert: true,
        'new': true
    };

    // Пробуем найти пользователя в db и заодно обновляем его данные на случай, если они изменились
    return this.findOneAndUpdate(conditions, {$set: update, $setOnInsert: setOnInsert}, options, function (err, user) {
        if (err) return callback(err);
        return callback(null, user.toJSON({virtuals: true}), user.created_at === created_at /** новый ли пользователь ?*/);
    })
};

/**
 * Возвращает пользователя по id соц. платформы
 * @param {number} viewer_id  - идентификатор пользователя в соц. платформе
 * @param {Function} callback - callback метод
 */
userSchema.statics.getUserBySocialId = function (viewer_id, callback) {

    // Пробуем найти пользователя в db
    return this.findOne({viewer_id: viewer_id}, function (err, user) {
        if (err) return callback(err);
        if (!user) return callback(null, null);

        // Возвращаем данные пользователя
        return callback(null, user.toJSON({virtuals: true}))
    });
};

/**
 * Обновляет поля пользователя
 * @param {string} id - идентификатор пользователя
 * @param {string} field - название поля
 * @param {*} value - значение поля
 * @param {function} [callback] - callback метод
 */
userSchema.statics.setUserField = function (id, field, value, callback) {
    var updateData = {};
    updateData[field] = value;

    return this.update({_id: id }, {$set: updateData}, {multi: false}, function (err) {
        if (err) console.log(err);

        if (typeof callback === 'function') {
            callback();
        }
    });
};


// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
