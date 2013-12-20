/*global jasmine:false, __coverage__:false, phantom:false */
window.TestHelpers = {
    fakes: {
        'Math': {
            random: function (callback) {
                return function () {
                    var ranNum = Math.random();
                    callback(ranNum);
                    return ranNum;
                };
            }
        }
    },
    fireEvent: function (el, event) {
        var evt = document.createEvent('HTMLEvents');
        evt.initEvent(event, false, true);
        el.dispatchEvent(evt);
    }
};