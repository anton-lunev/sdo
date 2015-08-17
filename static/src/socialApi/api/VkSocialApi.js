/**
 * http://vk.com/developers.php
 *
 * @param params
 * @param callback
 */
let VkSocialApi = (function() {

    return {
        makePayment: function(params) {
            var def = new $.Deferred();
            VK.callMethod('showOrderBox', params);

            VK.addCallback('onOrderSuccess', function(order_id) {
                console.log('PaymentModal complete');
                return def.resolve(order_id);
            });

            VK.addCallback('onOrderFail', function(res) {
                console.log('onOrderFail');
                return def.reject(res);
            });

            VK.addCallback('onOrderCancel', function(res) {
                console.log('onOrderCancel');
                return def.reject(res);
            });

            return def.promise();
        }

    };
})();

export default VkSocialApi;
