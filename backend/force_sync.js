const sequelize = require('./config/db');
require('./models/Alumno');
require('./models/Nota');
require('./models/User');
require('./models/Asistencia');
require('./models/Material');
require('./models/Actividad');

async function forceSync() {
    try {
        console.log('Sincronizando modelos...');
        // Alter false for now, we just want to ensure they exist
        await sequelize.sync();
        console.log('Sincronización terminada.');
    } catch (e) {
        console.error('Error durante sync:', e);
    } finally {
        process.exit();
    }
}
forceSync();
