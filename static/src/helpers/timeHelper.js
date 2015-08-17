/**
 * Манипуляции со временем
 * @author alunev
 */
let timeHelper = {
    /**
     * Отдаст время в виде min:sec
     * @param time Date
     * @returns {string}
     */
    getUTCTimerText: function (time) {
        var min = time.getUTCMinutes();
        var sec = time.getUTCSeconds();
        sec = sec < 10 ? '0' + sec : sec;

        return min + ':' + sec;
    },

    /**
     * Отдаст время в виде hour:min
     * @param time Date
     * @returns {string}
     */
    getTimerText: function (time) {
        var min = time.getMinutes();
        min = min < 10 ? '0' + min : min;

        return time.getHours() + ':' + min;
    },


    /**
     * Отдаст дату в виде month:day
     * @param time Date
     * @returns {string}
     */
    getDateTimerText: function (time) {
        var day = time.getDate();
        day = day < 10 ? '0' + day : day;

        var month = time.getMonth();
        month = month < 10 ? '0' + month : month;

        return day + '.' + month;
    }
};

export default timeHelper;
