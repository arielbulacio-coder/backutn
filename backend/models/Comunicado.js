const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Alumno = require('./Alumno');

const Comunicado = sequelize.define('Comunicado', {
    titulo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    mensaje: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    tipo: {
        type: DataTypes.ENUM('general', 'individual', 'llamado_atencion'),
        defaultValue: 'general'
    },
    destinatario_curso: {
        type: DataTypes.STRING,
        allowNull: true // Only for general
    },
    fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

Comunicado.belongsTo(User, { as: 'Emisor', foreignKey: 'EmisorId' });
Comunicado.belongsTo(Alumno, { as: 'DestinatarioAlumno', foreignKey: 'AlumnoId' }); // Optional, for individual

module.exports = Comunicado;
