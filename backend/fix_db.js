const { sequelize } = require('./index');

async function fix() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected');
        await sequelize.sync({ alter: true });
        console.log('Sync Alter Done');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
fix();
