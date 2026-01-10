const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const LibroTema = sequelize.define('LibroTema', {
    fecha: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
        allowNull: false
    },
    curso: {
        type: DataTypes.STRING,
        allowNull: false
    },
    materia: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tema: {
        type: DataTypes.STRING,
        allowNull: false
    },
    actividad: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    observacion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    ciclo_lectivo: {
        type: DataTypes.INTEGER,
        defaultValue: new Date().getFullYear()
    }
});

LibroTema.belongsTo(User, { as: 'Profesor', foreignKey: 'ProfesorId' });

module.exports = LibroTema;
