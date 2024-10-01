const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});
sequelize.authenticate((err) => {
    if (err) {
        console.error('Error connecting to MySQL: ', err);
    } else {
        console.log('Connected to MySQL!');
    }
});
sequelize.sync();
module.exports = { sequelize,DataTypes};
