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
        values: ['admin', 'alumno', 'profesor', 'padre', 'preceptor', 'jefe_preceptores', 'secretario', 'director', 'vicedirector'],
        defaultValue: 'alumno'
    },
    foto: {
        type: DataTypes.TEXT, // Base64 or URL
        allowNull: true
    },
    telefono: {
        type: DataTypes.STRING,
        allowNull: true
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    intereses: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    resetToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resetTokenExpiration: {
        type: DataTypes.DATE, // Timestamp de expiración
        allowNull: true
    }
});

module.exports = User;
