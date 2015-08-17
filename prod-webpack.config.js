/**
 * @author "Evgeny Reznichenko" <kusakyky@gmail.com>
 */

var
    makeConfig = require('./make-webpack-config');

module.exports = makeConfig({
    prod: true,
    uglify: false,
    pathinfo: true
});
