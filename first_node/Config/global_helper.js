const asset = function(path) {
    const appRoot = process.env.APP_BASE_URL || '';
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${appRoot}/${cleanPath}`;
};
module.exports = asset;