import "./SympathyPopup.less";
import langHelper from "../../helpers/langHelper.js";
import timeHelper from "../../helpers/timeHelper.js";

/**
 * Попап с вопросом
 *
 * @author alunev
 * @extends Backbone.View
 * @class
 */
let SympathyPopup = Backbone.View.extend({
    el: '#popup',
    template: require("./SympathyPopup.handlebars"),
    templateNextUser: require("./NextUser.handlebars"),

    events: {
        'click .sympathy-popup__button': 'setLike'
    },

    selectors: {
        timer: '.popup-next-user__info-timer'
    },

    timer: null,
    timeDiff: 0,

    initialize: function () {
        if (!this.model) {
            this.model = new Backbone.Model();
        }
    },

    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        this.renderNextUser();
        this.$timer = this.$(this.selectors.timer);
    },

    renderNextUser: function () {
        this.$('.popup-next-user').html(this.templateNextUser(this.model.toJSON()));
    },

    attach: function () {
        this.render();
    },

    detach: function () {
        clearInterval(this.timer);
        this.close();
    },

    setData: function (data, timeDiff) {
        this.timeDiff = timeDiff;

        if (data.queue) {
            data.queueList = langHelper.pluralForm({
                'one': 'человек',
                'few': 'человека',
                'other': 'человек'
            }, data.queue);
        } else {
            data.queueList = null;
        }

        this.model.set(data);
        return this;
    },

    setNextUser: function(data) {
        this.model.set('nextUser', data);
        this.renderNextUser();
    },

    /**
     * Скрыть попап
     */
    close: function () {
        this.$('.sympathy-popup').removeClass('sympathy-popup--show');
    },

    /**
     * Показать попап
     */
    show: function () {
        this.$('.sympathy-popup').addClass('sympathy-popup--show');
        this.startTimer();
    },

    /**
     * Запустить таймер
     */
    startTimer: function () {
        if (!this.model.get('nextUser')) {
            return;
        }

        var timeToNextUser = this.model.get('nextUser').timeStart + this.timeDiff;
        this.renderTimer(timeToNextUser - Date.now()); //Задаем начальное значение

        //var secLeft = 0;
        //var timeToNextUser = this.model.get('nextUser').timeStart - this.model.get('currentUser').timeEnd;

        clearInterval(this.timer);
        this.timer = setInterval(() => {
            //var time =  timeToNextUser - ++secLeft;
            var time = timeToNextUser - Date.now();
            time < 0 ? clearInterval(this.timer) : this.renderTimer(time);
        }, 1000);
    },

    /**
     * Рендер таймера
     * @param time {int}
     */
    renderTimer: function (time) {
        this.$timer.html(timeHelper.getUTCTimerText(new Date(time)));
    },

    /**
     * Понравился ли собеседник?
     * @param e
     */
    setLike: function (e) {
        var sympathy = $(e.target).hasClass('sympathy-popup__button--yes');
        socket.emit('action', {name: "sympathy", result: sympathy});

        this.$('.sympathy-popup__question').addClass('sympathy-popup__question--hide');
    }
});

export default SympathyPopup;
