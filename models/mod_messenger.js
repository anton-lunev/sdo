var mvc = require('../config/require.js');

var control = {
    setMessage: function (session, message) {
        // todo огрнаничение по вермени
        if (!message && message.length <= 1) {
            return false;
        }

        if (!session && session.roomId && session.partner) {
            return false;
        }

        var sessionPartner = mvc['models']['session'].control.getData(session.partner);

        if (!sessionPartner && sessionPartner.roomId && sessionPartner.partner && sessionPartner != session.id) {
            return false;
        }

        mvc['modules']['socket'].to(sessionPartner.socketId).emit('action', {name: 'message', result: message});

    }
};

exports.control = control;
