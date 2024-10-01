    const { sequelize, DataTypes } = require(process.env.APP_ROOT + '/Database/DB.js')
    // Kết nối đến cơ sở dữ liệu
    const User = sequelize.define('User', {
            // Các trường của bảng users
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false
            },

        }, { timestamps: false });
module.exports = User;
