const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ProfesorMateria = sequelize.define('ProfesorMateria', {
    email_profesor: {
        type: DataTypes.STRING,
        allowNull: false
    },
    curso: {
        type: DataTypes.STRING, // "5B"
        allowNull: false
    },
    materia: {
        type: DataTypes.STRING, // "Matemática"
        allowNull: false
    },
    ciclo_lectivo: {
        type: DataTypes.INTEGER,
        defaultValue: new Date().getFullYear()
    },
    planificacion_url: {
        type: DataTypes.STRING, // Link to Google Docs etc.
        allowNull: true
    }
});

module.exports = ProfesorMateria;
