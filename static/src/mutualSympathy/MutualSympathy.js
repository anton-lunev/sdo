import "./MutualSympathy.less";

/**
 * Встреча
 *
 * @author alunev
 * @task
 * @extends Backbone.View
 * @class
 */
let MutualSympathy = Backbone.View.extend({
    el: '#app',
    template: require("./MutualSympathy.handlebars"),

    events: {
        'click .mutual-sympathy__button-home': 'getStatus'
    },

    initialize: function() {
        console.log('MutualSympathy');
        if (!this.model) {
            this.model = new Backbone.Model();
        }
    },

    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
    },

    attach: function () {
        this.render();
    },

    detach: function () {

    },

    setData: function (data) {
        console.log(data);
        var newData = _.map(data, function (obj) {
            obj.name = obj.name.split(' ')[0];
            return obj;
        });

        this.model.set('data', newData);
        return this;
    },

    /**
     * Обновить статус (На главную)
     * @param sec
     */
    getStatus: function (sec) {
        socket.emit('action', {name: 'getStatus'});
    }

});

export default MutualSympathy;
