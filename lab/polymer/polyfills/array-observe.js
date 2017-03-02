Object.observe && !Array.observe && (function(O, A) {
"use strict";

var notifier = O.getNotifier,
    perform = "performChange",
    original = "_original",
    type = "splice";

var wrappers = {
    push: function push(item) {
        var args = arguments,
            ret = push[original].apply(this, args);

        notifier(this)[perform](type, function() {
            return {
                index: ret - args.length,
                addedCount: args.length,
                removed: []
            };
        });

        return ret;
    },
    unshift: function unshift(item) {
        var args = arguments,
            ret = unshift[original].apply(this, args);

        notifier(this)[perform](type, function() {
            return {
                index: 0,
                addedCount: args.length,
                removed: []
            };
        });

        return ret;
    },
    pop: function pop() {
        var len = this.length,
            item = pop[original].call(this);

        if (this.length !== len)
            notifier(this)[perform](type, function() {
                return {
                    index: this.length,
                    addedCount: 0,
                    removed: [ item ]
                };
            }, this);

        return item;
    },
    shift: function shift() {
        var len = this.length,
            item = shift[original].call(this);

        if (this.length !== len)
            notifier(this)[perform](type, function() {
                return {
                    index: 0,
                    addedCount: 0,
                    removed: [ item ]
                };
            }, this);

        return item;
    },
    splice: function splice(start, deleteCount) {
        var args = arguments,
            removed = splice[original].apply(this, args);

        if (removed.length || args.length > 2)
            notifier(this)[perform](type, function() {
                return {
                    index: start,
                    addedCount: args.length - 2,
                    removed: removed
                };
            }, this);

        return removed;
    }
};

for (var wrapper in wrappers) {
    wrappers[wrapper][original] = A.prototype[wrapper];
    A.prototype[wrapper] = wrappers[wrapper];
}

A.observe = function(object, handler) {
    return O.observe(object, handler, [ "add", "update", "delete", type ]);
};
A.unobserve = O.unobserve;

})(Object, Array);