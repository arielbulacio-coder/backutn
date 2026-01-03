const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Nota = sequelize.define('Nota', {
    valor: { type: DataTypes.DECIMAL(4, 2), allowNull: false },
    materia: { type: DataTypes.STRING, allowNull: false },
    trimestre: { type: DataTypes.INTEGER, defaultValue: 1 }
});

module.exports = Nota;
