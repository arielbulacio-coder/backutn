const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MateriaCurso = sequelize.define('MateriaCurso', {
    curso: { // Referencia por nombre (ej: '6o 2a') o ID si cambiamos a relaciones estrictas, usamos nombre por ahora para compatibilidad
        type: DataTypes.STRING,
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
