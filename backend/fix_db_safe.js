const sequelize = require('./config/db');
// Require all models to ensure they are attached to sequelize instance
require('./models/User');
require('./models/ProfesorMateria');
require('./models/Alumno');
require('./models/Material');
require('./models/Actividad');
require('./models/Entrega');
require('./models/Nota');
require('./models/Asistencia');

async function run() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected');
        await sequelize.sync({ alter: true });
        console.log('Database Synced (Alter)');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
