var crypto;
try {
    crypto = require('crypto');
    console.log('crypto support is enabled!');
} catch (err) {
    console.log('crypto support is disabled!');
}
