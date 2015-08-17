var request = require('request');

// URL для записи статистики
var URL = 'http://127.0.0.1:3002/api/';

// Callback для обработки запроса записи статитсики
function requestCallback (error, response, body) {
    if (error || response.statusCode != 200) {
        console.error('COHORT:ERROR:' + body);
    }
}

/**
 * @type {{}}
 */
module.exports = {

    /**
     * Записывает статистику заходов пользоваталей
     * @param {string} userId - идентификатор пользователя
     * @returns {Stream}
     */
    incUserLogin: function (userId) {
        return request(URL + 'userLogin?userId=' + userId, requestCallback);
    },

    /**
     * Записывает статистику регистраций пользователя
     * @param {string} userId - идентификатор пользователя
     * @returns {Stream}
     */
    incUserRegister: function (userId) {
        return request(URL + 'userRegister?userId=' + userId, requestCallback);
    },

    /**
     * Записывает статитсику покупок пользователя
     * @param {string} userId - идентификатор пользователя
     * @returns {Stream}
     */
    incUserPurchase: function (userId) {
        return request(URL + 'userPurchase?userId=' + userId, requestCallback);
    }
};