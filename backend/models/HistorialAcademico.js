const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const HistorialAcademico = sequelize.define('HistorialAcademico', {
    ciclo_lectivo: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    curso: {
        type: DataTypes.STRING,
        allowNull: false
    },
    condicion: {
        type: DataTypes.ENUM('regular', 'promovido', 'repitente', 'egresado'),
        defaultValue: 'regular'
    },
    promedio_general: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    observaciones: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'HistorialAcademicos'
});

module.exports = HistorialAcademico;
