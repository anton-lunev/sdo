var listFunction = {};

setInterval(function () {
    control.performsTheFunction();
}, 500);

control = {
    /**
     * Добавляет отложенную функцию (как по таймеру)
     * @param {number} time время исполнения
     * @param {function} deferredFunction функция
     * @param context контекст функции
     * @returns {boolean}
     */
    addFunction: function (time, deferredFunction, context) {
        var today = new Date();
        if (today > time) {
            return false;
        }

        listFunction[time] = deferredFunction.bind(context);
        return true;
    },

    performsTheFunction: function () {
        var today = new Date();
        for (var time in listFunction) {
            if (today > time) {
                listFunction[time]();
                this.deleteFunction(time);
            }
        }
    },

    deleteFunction: function (time) {
        delete listFunction[time];
    }
};
exports.control = control;
