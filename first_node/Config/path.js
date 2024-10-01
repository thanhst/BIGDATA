const path = require('path');
process.env.APP_ROOT = path.resolve(__dirname, '..');
module.exports = {
    APP_ROOT: process.env.APP_ROOT,
};
