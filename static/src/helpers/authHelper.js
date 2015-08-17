/**
 * Авторизация юзера
 * @author alunev
 */
let authHelper = {
    $_GET: function (key, url) {
        url = url || location.href;
        url = url.match(new RegExp(key + '=([^&=]+)'));
        return url ? url[1] : false;
    },

    getAuthInfo: function () {
        return {
            platform: 'vk',
            data: {
                viewer_id: this.$_GET('viewer_id'), // id пользователя
                api_id: this.$_GET('api_id'),  // ид приложения
                auth_key: this.$_GET('auth_key'), // ключ который сверяем
                access_token: this.$_GET('access_token') // токен
            }
        }
    }
};

export default authHelper;
