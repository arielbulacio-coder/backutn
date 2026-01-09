const sequelize = require('./config/db');
const Alumno = require('./models/Alumno');
const Nota = require('./models/Nota');
const HistorialAcademico = require('./models/HistorialAcademico');
require('./models/User');
const Asistencia = require('./models/Asistencia');
require('./models/User');
require('./models/Material');
require('./models/Actividad');

// Asociaciones
Alumno.hasMany(Nota, { as: 'Notas' });
Nota.belongsTo(Alumno);
Alumno.hasMany(HistorialAcademico, { as: 'Historial' });
HistorialAcademico.belongsTo(Alumno);
Alumno.hasMany(Asistencia, { as: 'Asistencias' });
Asistencia.belongsTo(Alumno);

async function forceSync() {
    try {
        console.log('Sincronizando modelos...');
        // Alter matching remote config
        await sequelize.sync({ alter: true });
        console.log('Sincronización terminada.');
    } catch (e) {
        console.error('Error durante sync:', e);
    } finally {
        process.exit();
    }
}
forceSync();
