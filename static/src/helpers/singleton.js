/**
 * Создаём ленивый синглтон из конструктора
 * @author alunev
 * @param Constructor
 * @returns {Function}
 */
let singleton = function (Constructor) {
    var singleton;
    return function () {
        if (!singleton) {
            singleton = new Constructor();
        }
        return singleton;
    };
};

export default singleton;
