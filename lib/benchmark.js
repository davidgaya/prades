'use strict';

/*
  Inserted in a promise chain, this function returns
  a formatted string with the time spend in the async functions.
 */
module.exports = function benchmark() {

    const time1 = new Date();
    return function (value) {
        const time2 = new Date();
        return ''+ value + ' took ' + ((time2 - time1)/1000) + " seconds";
    };

};
