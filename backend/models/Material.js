const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Material = sequelize.define('Material', {
    titulo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    curso: {
        type: DataTypes.STRING,
        allowNull: false
    },
    materia: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tipo: {
        type: DataTypes.ENUM('pdf', 'link', 'youtube', 'texto', 'video'),
        defaultValue: 'texto'
    },
    url: { // URL del archivo, video o link
        type: DataTypes.STRING,
        allowNull: true
    },
    ciclo_lectivo: {
        type: DataTypes.INTEGER,
        defaultValue: new Date().getFullYear()
    },
    trimestre: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1
    },
    unidad: {
        type: DataTypes.STRING,
        allowNull: true // Ej: "Unidad 1: Introducción"
    },
    visible: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});

module.exports = Material;
