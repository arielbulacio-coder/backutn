const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Alumno = sequelize.define('Alumno', {
    nombre: { type: DataTypes.STRING, allowNull: false },
    apellido: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, validate: { isEmail: true } },
    legajo: { type: DataTypes.STRING, unique: true },
    curso: {
        type: DataTypes.ENUM('1A', '1B', '1C', '2A', '2B', '2C'),
        allowNull: true
    },
    email_padre: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: { isEmail: true }
    }
});

module.exports = Alumno;
