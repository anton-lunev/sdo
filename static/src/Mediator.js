import Enter from './enter/Enter.js';
import Meeting from './meeting/Meeting.js';
import MutualSympathy from './mutualSympathy/MutualSympathy.js';

import singleton from './helpers/singleton.js';

var example1 = {
    cityName: "%D0%A1%D0%B0%D0%BD%D0%BA%D1%82-%D0%9F%D0%B5%D1%82%D0%B5%D1%80%D0%B1%D1%83%D1%80%D0%B3",
    freeRegister: false,
    freeSignTime: 179950,
    isLockedSex: false,
    isSigned: false,
    price: 3,
    timeServer: 1432903430028,
    timeStart: 1432204139000,
    yearsMax: 35,
    yearsMin: 15
};

var example2 = {
    currentUser: null/*{
     name: 'Антон',
     age: 25,
     photo: 'http://cs617122.vk.me/v617122363/11dd0/VoXuUWyPLCA.jpg',
     timeEnd: 1431631680003
     }*/,
    nextUser: {
        name: 'Антон',
        age: 18,
        photo: 'http://cs617122.vk.me/v617122363/11dd0/VoXuUWyPLCA.jpg',
        timeStart: 1431631680010
    },
    timeServer: 1431631680000,
    queue: 2
};

var example3 = {
    data: [
        {
            name: 'Антон',
            age: 25,
            photo: 'http://cs617122.vk.me/v617122363/11dd0/VoXuUWyPLCA.jpg',
            viewer_id: 5861363
        },
        {
            name: 'Антон',
            age: 25,
            photo: 'http://cs617122.vk.me/v617122363/11dd0/VoXuUWyPLCA.jpg',
            viewer_id: 5861363
        }
    ]
};

/**
 * Медиатор
 * Открываем страницы приложения
 *
 * @author alunev
 * @extends Backbone.View
 * @class
 */
let Mediator = Backbone.View.extend({
    Enter: singleton(Enter),
    Meeting: singleton(Meeting),
    MutualSympathy: singleton(MutualSympathy),

    currentScreen: 0,

    initialize: function () {
        //Проверяем инвалидов (IE9 и старше)
        if ((document.all && !window.atob) || window.WebSocket === undefined) {
            this.statusHandler({
                status: -1,
                codeErr: -1
            });
            return;
        }

        socket.on('authorization', (data) => {
            console.log('authorization', data);
            if (data.response !== 1) {
                this.Enter().setError(100 + data.response).render();
            } else {
                this.Enter().sex = data.sex;
            }
        });

        socket.on('meetingsController', (data) => {
            console.log('meetingsController', data);
            this.statusHandler(data);
        });
    },

    /**
     * Обрабатываем статусы с сервера
     * @param data
     */
    statusHandler: function (data) {
        if (this.currentScreen && data.status != this.currentScreen) {
            this.clearEvents();
        }

        //data.status = 1;
        //data.codeErr = 4;
        switch (data.status) {
            case -1:
                this.Enter().setError(data.codeErr).attach();
                this.currentScreen = -1;
                break;
            case 1:
                //data.data.isSigned = false;
                //data.data = example1;
                this.Enter().setData(data.data).attach();
                this.currentScreen = 1;
                break;
            case 2:
                //data.data = example2; //todo
                this.Meeting().setData(data.data).attach();
                this.currentScreen = 2;
                break;
            case 3:
                //data = example3; //todo
                this.MutualSympathy().setData(data.data).attach();
                this.currentScreen = 3;
                break;
        }

    },

    /**
     * Убрать подписки на события на прошлом экране
     */
    clearEvents: function () {
        switch (this.currentScreen) {
            case -1:
            case 1:
                this.Enter().detach();
                break;
            case 2:
                this.Meeting().detach();
                break;
            case 3:
                this.MutualSympathy().detach();
                break;
        }
    }
});

export default Mediator;
