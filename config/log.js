'use strict';

/**
 * Логирование со временем и названием файла
 * @param filename
 */
global.log = function (filename) {
    filename = filename.slice(filename.lastIndexOf('/') + 1 || filename.lastIndexOf('\\') + 1) + ' > ';
    var arg = [dataTime(), filename].concat([].slice.call(arguments, 1));
    console.log.apply(this, arg);
};

/**
 * Время
 * @returns {string}
 */
function dataTime() {
    var d = new Date();
    var curr = {
        date: d.getDate().toString(),
        month: (d.getMonth() + 1).toString(),
        year: d.getFullYear().toString(),
        hours: d.getHours().toString(),
        minutes: d.getMinutes().toString(),
        seconds: d.getSeconds().toString(),
    };

    if (curr.date.length < 2)  curr.date = '0' + curr.date;
    if (curr.month.length < 2)  curr.month = '0' + curr.month;
    if (curr.hours.length < 2)  curr.hours = '0' + curr.hours;
    if (curr.minutes.length < 2)  curr.minutes = '0' + curr.minutes;
    if (curr.seconds.length < 2)  curr.seconds = '0' + curr.seconds;

    return curr.year + "-" + curr.month + "-" + curr.date + ' ' + curr.hours + ':' + curr.minutes + ':' + curr.seconds + ' >';
}