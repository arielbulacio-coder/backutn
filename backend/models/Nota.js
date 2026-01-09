const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Nota = sequelize.define('Nota', {
    materia: { type: DataTypes.STRING, allowNull: false },


    ciclo_lectivo: {
        type: DataTypes.INTEGER,
        defaultValue: new Date().getFullYear()
    },

    // Trimestre 1
    t1_p1: { type: DataTypes.DECIMAL(4, 2) },
    t1_p2: { type: DataTypes.DECIMAL(4, 2) },
    t1_p3: { type: DataTypes.DECIMAL(4, 2) },

    // Trimestre 2
    t2_p1: { type: DataTypes.DECIMAL(4, 2) },
    t2_p2: { type: DataTypes.DECIMAL(4, 2) },
    t2_p3: { type: DataTypes.DECIMAL(4, 2) },

    // Trimestre 3
    t3_p1: { type: DataTypes.DECIMAL(4, 2) },
    t3_p2: { type: DataTypes.DECIMAL(4, 2) },
    t3_p3: { type: DataTypes.DECIMAL(4, 2) },

    // Finales y Recuperatorios
    final_anual: { type: DataTypes.DECIMAL(4, 2) },
    recup_diciembre: { type: DataTypes.DECIMAL(4, 2) },
    recup_febrero: { type: DataTypes.DECIMAL(4, 2) },
    final_cursada: { type: DataTypes.DECIMAL(4, 2) }
});

module.exports = Nota;
