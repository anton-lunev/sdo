var control = {
    /**
     * Узнать возраст
     * @param year
     * @param month
     * @param day
     * @returns {number}
     */
    getAge: function (year, month, day) {
        if (!year || !month || !day) {
            return 0;
        }

        var today = new Date();
        var today_year = today.getFullYear();

        // дата рождения
        var bdate = new Date(year, month, day);

        return today_year - year - (today.getTime() < bdate.setFullYear(today_year));
    }
};

exports.control = control;
