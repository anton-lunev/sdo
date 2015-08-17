var https = require('https');
var http = require('http');

control = {
    /**
     * Получение данных из вк
     * @param {string} method Метод вк
     * @param {Object} data Параметры запроса
     * @param {Function} [callback]
     * @see https://vk.com/dev/methods
     * todo ошибки проверять именно здесь!
     */
    getVK: function (method, data, callback) {
        var stringData = '';

        for (var key in data) {
            if (stringData.length > 1) {
                stringData += '&';
            }
            stringData += key + '=' + data[key];
        }

        var options = {
            hostname: 'api.vk.com',
            port: 443,
            path: '/method/' + method + '?' + stringData,
            method: 'GET'
        };

        this.getAjax(options, function(error, status, output){
            callback(JSON.parse(output));
        })
    },

    getAjax: function (options, callback) {
        // в зависимости от порта подключаем библиотеку
        var prot = options.port == 443 ? https : http;

        // отправляем запрос на сервер
        var req = prot.request(options, function (res) {
            var output = '';

            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                output += chunk;
            });
            res.on('end', function () {
                callback(null, res.statusCode, output);
            });
        });
        req.on('error', function (err) {
            //res.send('error: ' + err.message);
        });
        req.end();
    }
};

exports.control = control;
