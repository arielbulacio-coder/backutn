const sequelize = require('./config/db');
async function f() {
    try {
        const [results] = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
        console.log('Tablas:', results.map(x => x.table_name));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
f();
