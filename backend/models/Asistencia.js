const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Asistencia = sequelize.define('Asistencia', {
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    estado: {
        type: DataTypes.ENUM('presente', 'ausente', 'tarde', 'justificado'),
        defaultValue: 'presente'
    },
    observacion: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Asistencia;
