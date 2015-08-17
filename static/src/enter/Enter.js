import "./Enter.less";
import AboutPopup from "./aboutPopup/AboutPopup.js";
import singleton from '../helpers/singleton.js';
import langHelper from "../helpers/langHelper.js";
import timeHelper from "../helpers/timeHelper.js";
import authHelper from '../helpers/authHelper.js';

/**
 * Страница записи
 * @author alunev
 * @extends Backbone.View
 * @class
 */
let Enter = Backbone.View.extend({
    el: '#app',
    template: require("./Enter.handlebars"),

    events: {
        'click .enter-block__button--active': 'subscribe',
        'click .enter-block__button--update': 'updateAuth',
        'click .enter-block__button--close-another': 'closeAnotherTab',
        'click .enter-block__about': 'openAboutPopup'
    },

    selectors: {
        timer: '.enter-block__list-item--time'
    },

    timer: null,
    timeDiff: 0,
    sex: 0,

    animated: false,

    aboutPopup: singleton(AboutPopup),

    initialize: function () {
        if (!this.model) {
            this.model = new Backbone.Model();
        }
        this.tGetStatus = _.throttle(this.getStatus, 5000);
    },

    attach: function () {
        return this.render().subscribeToEvents();
    },

    detach: function () {
        clearInterval(this.timer);
        socket.removeListener('action');
    },

    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        this.model.set('animated', this.animated);
        setTimeout(() => {
            this.$('.enter-block').removeClass('enter-block--animation');
        }, 100);

        this.$timer = this.$(this.selectors.timer);
        this.$timer.html(this.getTime());//Задаем начальное значение
        this.aboutPopup().render();
        return this;
    },

    /**
     * Подписка на события
     */
    subscribeToEvents: function () {
        this.detach();

        this.startTimer();

        socket.on('action', (res) => {
            console.log('action', res);//{name: "editFreeSignTime", result: true}

            switch (res.name) {
                case 'closeTab':
                    this.setError(102).render();
                    break;
            }

            if (this.model.get('isSigned')) {
                return;
            }

            switch (res.name) {
                case 'editFreeSignTime':
                    console.log('freeRegister');
                    this.setFreeRegister(res.result).render();
                    break;
                case 'editIsLockedSex':
                    this.setIsLockedSex(res.result === this.sex).render();
                    break;
                case 'editSignedUp':
                    this.setIsSigned(res.result).render();
                    break;
            }
        });
        return this;
    },

    /**
     * Установить данные в модель
     * @param data
     */
    setData: function (data) {
        this.timeDiff = Date.now() - data.timeServer;

        this.model.clear();
        var pageData = $.extend({}, data);
        pageData.cityName = decodeURIComponent(pageData.cityName);
        pageData.time = this.getTime(data);
        pageData.price = this.getPrice(data);
        pageData.animated = this.animated;
        this.animated = true;
        if (data.isSigned) {
            this.setIsSigned(data.isSigned)
        } else if (data.isLockedSex) {
            this.setIsLockedSex(data.isLockedSex);
        }
        this.model.set(pageData);
        return this;
    },

    updateAuth: function () {
        socket.emit('authorization', authHelper.getAuthInfo());
    },

    closeAnotherTab: function () {
        var authInfo = authHelper.getAuthInfo();
        authInfo.data.closeAnotherTab = true;
        socket.emit('authorization', authInfo);
    },

    /**
     * Показать сообщение ошибки
     * @param codeErr
     */
    setError: function (codeErr) {
        var options = {
            cantBuy: true,
            error: true,
            updateButton: false,
            closeAnotherTabButton: false
        };

        switch (codeErr) {
            case -2:
                options.message = "Соединение не было установлено.<br/>Обновите страницу.";
                break;
            case -1:
                options.message = "Приложение поддерживает браузеры<br/>Chrome 14+, Firefox 6+, Safari 6+, Opera 12.1+, IE 10+";
                break;
            case 1:
                options.message = "Мы не нашли для вас подходящих встреч :(";
                break;
            case 2:
                options.message = "Встреча переносится.<br/>Вы можете бесплатно посетить одну из следующих встреч.";
                this.getStatus(10000);
                break;
            case 3:
                options.message = "Встреча переносится :(";
                this.getStatus(10000);
                break;
            case 4:
                options.message = "Вы предоставили не все данные о себе.<br/>Заполните в профиле дату рождения, пол и город проживания";
                options.updateButton = true;
                break;
            case 102:
                options.message = "Данное приложение уже открыто в другой вкладке";
                options.closeAnotherTabButton = true;
                break;
            case 103:
                options.message = "Нам не удалось вас авторизировать :(";
                break;
            default:
                options.message = "Что-то пошло не так :(";
        }

        this.model.set(options);
        return this;
    },

    /**
     * Обновить статус
     * @param sec
     */
    getStatus: function (sec = 1000) {
        setTimeout(() => {
            socket.emit('action', {name: 'getStatus'});
        }, sec);
    },

    /**
     * Установить значение записи на встречу
     * @param val
     */
    setIsSigned: function (val) {
        this.model.set({
            cantBuy: val,
            isSigned: val,
            message: "Вы записаны на встречу"
        });
        return this;
    },

    /**
     * Установить блокировку записи по полу
     * @param val
     */
    setIsLockedSex: function (val) {
        this.model.set({
            cantBuy: val,
            isLockedSex: val,
            message: "К сожалению, мест больше нет"
        });
        return this;
    },

    /**
     * Установить бесплатную запись
     * @param val
     */
    setFreeRegister: function (val) {
        this.model.set({
            freeRegister: val
        });
        return this;
    },

    /**
     * Получить фразу с ценой
     * @param data
     * @returns {string}
     */
    getPrice: function (data) {
        return langHelper.pluralForm({
            'one': 'голос',
            'few': 'голоса',
            'other': 'голосов'
        }, data.price);
    },


    startTimer: function () {
        clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.$timer.html(this.getTime());
        }, 1000);
    },

    /**
     * Получить фразу с оставшимся временем до встречи
     * @returns {string}
     */
    getTime: function () {
        var time = new Date(this.model.get('timeStart') + this.timeDiff);
        var timeToStart = new Date(time - Date.now());
        var timeIsEnd = time - Date.now() < 0;

        if(timeToStart.getUTCDate() > 1) {
            return 'Встреча начнется ' + timeHelper.getDateTimerText(time) + ' в ' + timeHelper.getTimerText(time);
        } else if (timeToStart.getUTCHours() < 1 || timeIsEnd) {
            if (timeToStart.getUTCMinutes() < 1 || timeIsEnd) {
                if(timeIsEnd) {
                    if(!this.model.get('isSigned')) {
                        this.deactivateButton();
                        this.tGetStatus();
                    }
                    clearInterval(this.timer);
                }
                return 'До начала встречи менее 1 минуты';
            } else {
                return 'До начала встречи осталось ' + langHelper.pluralForm({
                        'one': 'минута',
                        'few': 'минуты',
                        'other': 'минут'
                    }, timeToStart.getUTCMinutes() + 1);
            }
        } else {
            return 'Встреча начнется в ' + timeHelper.getTimerText(time);
        }
    },

    deactivateButton: function () {
        this.$('.enter-block__button')
            .removeClass('enter-block__button--active')
            .addClass('enter-block__button--inactive');
    },

    /**
     * Записаться на встречу
     */
    subscribe: function () {
        if (this.model.get('cantBuy')) {
            return false;
        } else if (this.model.get('freeRegister')) {
            socket.emit('action', {name: 'freeRegister'});
            this.deactivateButton();
        } else {
            SocialApi.makePayment({
                item: 'subscribe_default',
                type: 'item'
            }).done((order_id) => {
                this.getStatus();
            });
        }
    },

    openAboutPopup: function () {
        this.aboutPopup().show();
        var params = {
            n: 'osd_show_about_popup',
            c: 1,
            r: Math.random()
        };

        var url = `//topface.com/stats/clicks/?n=${params.n}&c=${params.c}&r=${params.r}`;
        var image = new Image();
        image.src = url;
    }
});

export default Enter;
