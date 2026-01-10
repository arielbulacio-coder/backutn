const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MateriaCurso = sequelize.define('MateriaCurso', {
    anio: { // Año del plan (1 al 7)
        type: DataTypes.INTEGER,
        allowNull: false
    },
    materia: { // Referencia por nombre (ej: 'Matemática')
        type: DataTypes.STRING,
        allowNull: false
    },
    ciclo_lectivo: {
        type: DataTypes.INTEGER,
        defaultValue: new Date().getFullYear()
    }
});

module.exports = MateriaCurso;
