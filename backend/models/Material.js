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
        type: DataTypes.ENUM('pdf', 'link', 'youtube', 'texto'),
        defaultValue: 'texto'
    },
    url: { // URL del archivo, video o link
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Material;
