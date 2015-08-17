
/**
 * Отдает фразу с нужной плюральной формой
 *
 * @author alunev
 * @class
 */
let langHelper = {
    /**
     * отдает фразу с нужной плюральной формой
     * @param phrases
     * @param number
     * @returns {*}
     */
    pluralForm: function (phrases, number) {
        number = Math.abs(number);
        var key;
        if (number == 0 && phrases['zero']) {
            key = 'zero';
        } else {
            key = this._getKey(number);
        }
        return `${number} ${phrases[key]}`;
    },

    /**
     * получаем ключ формы слова
     * @param number
     * @return {String}
     */
    _getKey: function(number) {
        number %= 100;
        if (number >= 5 && number <= 20) {
            return 'other';
        }
        number %= 10;
        if (number == 1) {
            return 'one';
        }
        if (number >= 2 && number <= 4) {
            return 'few';
        }
        return 'other';
    }
};

export default langHelper;
