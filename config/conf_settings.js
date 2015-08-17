'use strict';
/**
 * @file Задает настроки сервера в зависимости от включенной модификации
 */

/**
 * Модификация сервера.
 * @type {string}
 */
//var mode = ‌‌process.env.NODE_ENV || 'development';
var mode = process.env.NODE_ENV || 'development';
/**
 * Настроки сервера
 * @type {Object} development Модификация для локальной разработки
 * @type {Object} production Модификация для сервера
 */
exports.conf = (function (env) {
    return {
        development: {
            version: 0.1,
            server: {
                port: 3000
            },
            socket: {
                port: 3001
            },
            vkApp: {
                id: 4913690,
                secret: 'VFECKimg6mZX8ZX41P1u'
            },
            path: '',
            db_url: 'mongodb://user:user@ds033400.mongolab.com:33400/site',
            products: {
                subscribe_default: {
                    item_id: 'subscribe',
                    title: 'Запись на встречу',
                    photo_url: '',
                    price: 3
                }
            }
        },

        production: {
            version: 0.1,
            server: {
                port: 3000
            },
            socket: {
                port: 3001
            },
            vkApp: {
                id: 4912157,
                secret: 'q7medEYshrHIgUODklKEhahhahaha'
            },
            path: '',
            db_url: 'mongodb://localhost:27017/site',
            products: {
                subscribe_default: {
                    item_id: 'subscribe',
                    title: 'Запись на встречу',
                    photo_url: '',
                    price: 3
                }
            }
        }
    }[env]

}(mode));

exports.mode = mode;
