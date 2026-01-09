const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Asistencia = sequelize.define('Asistencia', {
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    // presente field removed in favor of 'estado' enum
    ciclo_lectivo: {
        type: DataTypes.INTEGER,
        defaultValue: new Date().getFullYear()
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
