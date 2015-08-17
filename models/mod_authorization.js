'use strict';

var mvc = require('../config/require.js');


var control = {
    /**
     *
     * @param {Object} data данные из соц сети
     * @param callback
     * @param callbackError
     */
    authorizationInVk: function (data, callback, callbackError) {
        // todo функция для перечесления параметров
        if (!data.hasOwnProperty('api_id')
            || !data.hasOwnProperty('viewer_id')
            || !data.hasOwnProperty('auth_key')
            || !data.hasOwnProperty('access_token')
        ) {
            return false;
        }

        var md5 = mvc['modules']['md5'];

        var auth_key = md5(data.api_id + '_' + data.viewer_id + '_' + mvc['config']['settings'].conf.vkApp.secret);

        // левый пользователь
        if (auth_key != data.auth_key) {
            console.log('fail user', data);
            return false;
        }

        var vkParameters = {
            fields: 'photo_max_orig,sex,bdate,city',
            v: '5.31',
            viewer_id: data.viewer_id,
            user_id: data.viewer_id,
            userId: data.viewer_id
            //access_token: data.access_token
        };

        return mvc['fw']['ajax'].control.getVK('users.get', vkParameters, function (dataVK) {

            if (!dataVK || !dataVK.response) {
                log(__filename, 'error callback <users.get> in vk', dataVK, data.viewer_id);
                return;
            }
            var userData = dataVK.response[0];

            if (!userData && (!userData.id || !userData.sex || !userData.bdate || userData.bdate.length < 8 || !userData.city.id)) {
                console.log('access denied; fail parameters user in vk;');
                if (callbackError) {
                    callbackError(4);
                }
                return;
            }

            return mvc['models']['dbUserModel'].fetchUser(userData, function (err, user, isNew) {
                if (err) throw err; // todo: return err

                // Пишем статистику для когортного анализа
                if (isNew) {
                    // пишем статистику регистрации для нового юзера
                    mvc['modules'].cohort.incUserRegister(user.viewer_id);
                }

                // gbitv статистику для логина юзера
                mvc['modules'].cohort.incUserLogin(user.viewer_id);

                if (callback) {
                    callback(mvc['models']['session'].control.addData(user));
                }

            }.bind(this));
        }.bind(this));
    }

};

exports.control = control;
