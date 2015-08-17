'use strict';
/**
 **
 **
 **/

var mvc = require('../config/require.js');

var server = {
    onIndex: function (req, res) {
        res.sendFile(mvc['config']['settings'].path + '/static/public/index.html');
    },

    onStaticFiles: function (req, res) {
        res.sendFile(mvc['config']['settings'].path + '/static/public' + req._parsedUrl.pathname);
    },

    onPing: function (req, res) {
        return res.status(200).end();
    },

    onPaymentSecure: function (req, res) {
        var item = req.body.item,
            notificationType = req.body.notification_type,
            params = req.body,
            response;

        // Проверяем валидность параметров от ВК
        if (!mvc['modules'].signinGenerator.check(params)) {
            return res.json({
                error: {
                    error_code: 10,
                    error_msg: 'Несовпадение вычисленной и переданной подписи запроса.',
                    critical: true
                }
            });
        }

        // Обрабатываем типы нотификаций
        switch (notificationType) {
            case 'get_item':
                return response = mvc['modules']['payment'].getItemsInfo(item, function (response) {
                    res.json(response);
                });

            // Получение данных продукта
            case 'get_item_test':
                return response = mvc['modules']['payment'].getItemsInfo(item, function (response) {
                    res.json(response);
                });

            case 'order_status_change':
                // todo: убрать копипасту
                return mvc['modules']['payment'].getStatusChange(params, function (err, user, response) {
                    if (err) return res.json(err);

                    // пишем статистику покупок юзера
                    mvc['modules'].cohort.incUserPurchase(params.user_id);

                    var session = mvc['models']['session'].control.getData(user.id);
                    if (!mvc['models']['meetings'].control.setSignUpMeeting(session)) {
                        return res.json({
                            response: {
                                error_code: 102,
                                error_msg: 'Can not get user data to complete payment action.',
                                critical: true
                            }
                        });
                    }

                    res.json(response);
                });

            // Изменение статуса заказа в тестовом режиме
            case 'order_status_change_test':
                // todo: убрать копипасту
                return mvc['modules']['payment'].getStatusChange(params, function (err, user, response) {
                    if (err) return res.json(err);

                    var session = mvc['models']['session'].control.getData(user.id);
                    if (!mvc['models']['meetings'].control.setSignUpMeeting(session)) {
                        return res.json({
                            response: {
                                error_code: 102,
                                error_msg: 'Can not get user data to complete payment action.',
                                critical: true
                            }
                        });
                    }

                    res.json(response);
                });
        }

        return res.json({
            error: {
                error_code: 10,
                error_msg: 'Несуществующий тип "' + notificationType + '"',
                critical: true
            }
        });
    }
};

exports.server = server;
