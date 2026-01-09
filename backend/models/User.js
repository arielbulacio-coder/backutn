const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM,
        values: ['admin', 'alumno', 'profesor', 'padre', 'preceptor', 'jefe_preceptores', 'secretario', 'director'],
        defaultValue: 'alumno'
    }
});

module.exports = User;
