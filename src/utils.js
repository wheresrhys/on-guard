define(function () {

    var pickRandomProperty = function (obj) {
            var result;
            var count = 0;
            for (var prop in obj) {
                if (Math.random() < 1 / ++count) {
                    result = prop;
                }
            }
                   
            return result;
        },

        defineProps = function (obj) {
            var prop;
            for (var key in obj) {
                prop = obj[key];
                if (prop._propertyDefinition) {
                    delete obj[key];
                    Object.defineProperty(obj, key, prop);
                }
            }
            return obj;
        },

        extendObj = function (base) {
            var extenders = Array.prototype.slice.call(arguments, 1),
                extender;

            if (!extenders.length) {
                return base;
            }

            if (extenders.length > 1) {
                extender = extendObj.apply(this, extenders);
            } else {
                extender = extenders[0];
            }

            for (var key in extender) {
                base[key] = extender[key];
            }

            return base;
        },
        toCamel = function (text) {
            return text.replace(/\-\w/g, function ($0) {
                return $0.toUpperCase();
            });
        },
        fromCamel = function(text) {
            return text.replace(/\w[A-Z]/g, function ($0) {
                return $0.charAt(0) + '-' + $0.charAt(1).toLowerCase();
            });
        },
        dashedToSpaced = function (text) {
            return text.replace('-', ' ');
        },
        camelToSpaced = function (text) {
            return fromCamel(text).replace('-', ' ');
        };

    return {
        pickRandomProperty: pickRandomProperty,
        defineProps: defineProps,
        extendObj: extendObj,
        toCamel: toCamel,
        fromCamel: fromCamel,
        dashedToSpaced: dashedToSpaced,
        camelToSpaced: camelToSpaced
    };
});