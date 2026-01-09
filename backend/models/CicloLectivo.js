const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CicloLectivo = sequelize.define('CicloLectivo', {
    anio: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    fecha_inicio: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    fecha_fin: {
        type: DataTypes.DATEONLY,
        allowNull: false
    }
});

module.exports = CicloLectivo;
