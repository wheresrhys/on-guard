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

(function () {
    var reporter = new jasmine.Reporter();
    /**
    * Reports the coverage variable by dispatching a message from phantom.
    *
    * @method reportRunnerResults
    */
    reporter.reportRunnerResults = function () {
        if (__coverage__) {
            console.log(__coverage__);
            phantom.sendMessage('jasmine.coverage', __coverage__);
        }
    };
    jasmine.getEnv().addReporter(reporter);
})();