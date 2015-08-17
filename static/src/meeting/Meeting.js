import "./Meeting.less";
import SympathyPopup from './sympathyPopup/SympathyPopup.js';
import singleton from '../helpers/singleton.js';
import timeHelper from "../helpers/timeHelper.js";

/**
 * Встреча
 *
 * @author alunev
 * @extends Backbone.View
 * @class
 */
let Meeting = Backbone.View.extend({
    el: '#app',
    template: require("./Meeting.handlebars"),
    messageTemplate: require("./Message.handlebars"),
    SympathyPopup: singleton(SympathyPopup),

    events: {
        'submit #meeting-chat-form': 'sendMessage'
    },

    selectors: {
        timer: '.meeting-block__timer'
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

        this.show();
        this.$timer = this.$(this.selectors.timer);
    },

    show: function () {
        setTimeout(() => {
            this.$('.meeting-block').addClass('meeting-block--show');
        }, 0);
    },

    attach: function () {
        this.render();
        this.SympathyPopup().attach();
        this.subscribeToEvents();
        this.startTimer();
    },

    detach: function () {
        clearInterval(this.timer);
        socket.removeListener('action');
        this.SympathyPopup().detach();
    },

    subscribeToEvents: function () {
        this.detach();

        socket.on('action', (res) => {
            console.log('action', res);//{name: "message", result: message}

            switch (res.name) {
                case 'message':
                    if (res.result) {
                        this.appendMessage(res.result, 'left');
                    }
                    break;
                case 'editNextUser':
                    this.SympathyPopup().setNextUser(res.result);
                    break;
            }
        });
    },

    setData: function (data) {
        this.timeDiff = Date.now() - data.timeServer;

        if(data.currentUser) {
            data.currentUser.name = data.currentUser.name.split(' ')[0];
        }

        this.model.set(data);
        this.SympathyPopup().setData(data, this.timeDiff);
        return this;
    },


    /**
     * Отправить сообщение
     * @param e
     */
    sendMessage: function (e) {
        e.preventDefault();
        var $msgInput = this.$('.meeting-chat__input');
        if (!$msgInput.val()) {
            return;
        }
        this.appendMessage($msgInput.val().substr(0, 300), 'right');
        socket.emit('action', {name: 'message', result: $msgInput.val()});
        $msgInput.val('');
    },

    /**
     * Добавить сообщение в чат
     * @param message
     * @param side
     */
    appendMessage: function (message, side) {
        this.$('.chat-messages').append(this.getMessageTpl(message, side));
        this.scrollChatToEnd();
        this.$('.chat-messages').find('.chat-messages__item').addClass('chat-messages__item--show');
    },

    /**
     * Вернет разметку сообщения
     * @param message
     * @param side
     * @returns {*}
     */
    getMessageTpl: function (message, side) {
        return this.messageTemplate({
            message: message,
            side: side
        });
    },

    /**
     * Скролл чата вниз
     */
    scrollChatToEnd: function () {
        var $chatBody = this.$('.meeting-chat__messages');
        $chatBody.scrollTop($chatBody.get(0).scrollHeight);
    },


    /**
     * Запустить таймер
     */
    startTimer: function () {
        if (!this.model.get('currentUser')) {
            this.showPopup();
            return;
        }

        var timeEnd = this.model.get('currentUser').timeEnd + this.timeDiff;
        this.renderTimer(timeEnd - Date.now()); //Задаем начальное значение

        //var secLeft = 0;
        //var timeToEnd = this.model.get('currentUser').timeEnd - this.model.get('timeServer');

        clearInterval(this.timer);
        this.timer = setInterval(() => {
            //var time = timeToEnd - ++secLeft;
            var time = timeEnd - Date.now();
            if (time < 0) {
                clearInterval(this.timer);
                this.$('.meeting-chat__input').attr('disabled', true);
                this.$timer.removeClass('meeting-block__timer--beat');
                this.showPopup();
            } else {
                if(time < 30000) {
                    this.$timer.addClass('meeting-block__timer--beat');
                }
                this.renderTimer(time);
            }
        }, 1000);
    },

    /**
     * Рендер таймера
     * @param time {int}
     */
    renderTimer: function (time) {
        this.$timer.html(timeHelper.getUTCTimerText(new Date(time))).hide(0).show(0);
    },

    showPopup: function () {
        this.SympathyPopup().show();
    }
});

export default Meeting;
