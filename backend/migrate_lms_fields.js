const { sequelize } = require('./index');

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected');

        // This will alter tables to add new columns
        await sequelize.sync({ alter: true });
        console.log('Database synced with alter: true. New columns added.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
