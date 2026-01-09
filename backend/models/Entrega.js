const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Entrega = sequelize.define('Entrega', {
    fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    archivo_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    ciclo_lectivo: {
        type: DataTypes.INTEGER,
        defaultValue: new Date().getFullYear()
    },
    comentario: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    calificacion: {
        type: DataTypes.FLOAT, // 1 to 10
        allowNull: true
    },
    devolucion: {
        type: DataTypes.TEXT, // Feedback from teacher
        allowNull: true
    }
});

module.exports = Entrega;
