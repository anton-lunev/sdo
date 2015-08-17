import "./app.less";
import Mediator from './Mediator.js';
import SocialAPI from './socialApi/SocialAPI.js';
import authHelper from './helpers/authHelper.js';

if(window.top === window.self) {
    location.href = '//vk.com/app4912157_5861363'
}

$(() => {
    //Показываем ошибку, если нет коннекта 10 секунд
    var connected = false;

    window.socket = io.connect("//" + window.document.domain + (window.location.port) ? ':' + window.location.port : '', {
        transports: [
            'websocket',
            'xhr-polling',
            'jsonp-polling',
            'polling'
        ]
    });

    socket.on("connect", function () {
        connected = true;
        socket.emit('authorization', authHelper.getAuthInfo());
    });

    global.SocialApi = new SocialAPI();

    VK.init(function () {
        VK.loadParams(document.location.href);
        global.Mediator = new Mediator();
    });

    setTimeout(() => {
        if (!connected && global.Mediator.currentScreen === 0) {
            global.Mediator.statusHandler({
                status: -1,
                codeErr: -2
            });
        }
    }, 10000);

});



