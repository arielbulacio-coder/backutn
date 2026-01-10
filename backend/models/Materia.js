const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Materia = sequelize.define('Materia', {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    anio: { // Nivel sugerido (1, 2, 3...) opcional
        type: DataTypes.INTEGER,
        allowNull: true
    },
    tipo: { // 'teoria', 'taller'
        type: DataTypes.STRING,
        defaultValue: 'teoria'
    }
});

module.exports = Materia;
