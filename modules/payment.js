/**
 * Генератор подписи для контакта
 * @class
 */

var _ = require('lodash-node');

var mvc = require('../config/require.js');

/**
 * Уведомление о получении информации о товаре
 * @param {string} item - название товара
 * @param {function} callback - callback метод
 */
exports.getItemsInfo = function (item, callback) {
    var config = mvc['config']['settings'].conf.products,
        product = config[item];

    // Если такого пака нет, то выходим с ошибкой
    if (!product) {
        return process.nextTick(function () {
            callback({
                response: {
                    error_code: 20,
                    error_msg: 'Товара не существует.',
                    critical: true
                }
            });
        });
    }

    // Возвращаем данные товара
    return process.nextTick(function () {
        callback({
            response: {
                item_id: product.item_id,
                title: product.title,
                price: product.price
            }
        })
    });
};

/**
 * Уведомление об изменении статуса заказа
 * @param params - данные запроса ВК
 * @param callback - callback метод
 * @returns {*}
 */
exports.getStatusChange = function(params, callback) {
    var config = mvc['config']['settings'].conf.products;

    if (params['status'] !== 'chargeable') {
        return callback({
            response: {
                error_code: 100,
                error_msg: 'Bad params passed.',
                critical: true
            }
        });
    }

    var order_id = parseInt(params['order_id'], 10),
        item = params['item'],
        product = config[item],
        viewer_id = params['user_id'];

    // Продукт должен существовать
    if (!product) {
        console.error('PAYMENT_ERROR: Item: "' + item + '" does not exist');

        return callback({
            response: {
                error_code: 20,
                error_msg: 'Товара не существует.',
                critical: true
            }
        });
    }

    // Находим пользователя по id
    return mvc['models']['dbUserModel'].getUserBySocialId(viewer_id, function (err, user) {
        if (err) {
            console.error("PAYMENT_ERROR: " + err.message);

            return callback({
                response: {
                    error_code: 2,
                    critical: false
                }
            });
        }

        if (!user) {
            console.error('PAYMENT_ERROR: Unable to find user by social_id: "' + viewer_id + '"');

            return callback({
                response: {
                    error_code: 22,
                    critical: true
                }
            });
        }

        // Код проверки товара, включая его стоимость
        var app_order_id = 1; // Получающийся у вас идентификатор заказа. (возможно не используется)

        return callback(null, user, {
            response: {
                order_id: order_id,
                app_order_id: app_order_id
            }
        });
    });
};
