/**
 * @author "Evgeny Reznichenko" <kusakyky@gmail.com>
 */

var
    makeConfig = require('./make-webpack-config');

module.exports = makeConfig({
    uglify: false,
    pathinfo: true
});
