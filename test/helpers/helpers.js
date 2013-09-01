window.TestHelpers = {
    fakes: {
        'Math': {
            random: function (callback) {
                return function () {
                    var ranNum = Math.random();
                    callback(ranNum);
                    return ranNum;
                }
            }
        }
    }
}