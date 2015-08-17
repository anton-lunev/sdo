import "./AboutPopup.less";

/**
 * Попап с вопросом
 *
 * @author alunev
 * @extends Backbone.View
 * @class
 */
let AboutPopup = Backbone.View.extend({
    el: '#popup',
    template: require("./AboutPopup.handlebars"),

    events: {
        'click .about-popup__close': 'close'
    },

    initialize: function () {
        if (!this.model) {
            this.model = new Backbone.Model();
        }
    },

    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
    },

    /**
     * Скрыть попап
     */
    close: function () {
        this.$('.about-popup').removeClass('about-popup--show');
        $('.app').removeClass('app--blur');
    },

    /**
     * Показать попап
     */
    show: function () {
        $('.app').addClass('app--blur');
        this.$('.about-popup').addClass('about-popup--show');
    }
});

export default AboutPopup;
