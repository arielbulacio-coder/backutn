const sequelize = require('./config/db');
async function f() {
    try {
        const [mats] = await sequelize.query('SELECT * FROM "Materials"');
        console.log(`Total Materials: ${mats.length}`);
        mats.forEach(m => console.log(`- ${m.titulo} | ${m.curso} | ${m.materia}`));

        const [acts] = await sequelize.query('SELECT * FROM "Actividads"');
        console.log(`Total Actividades: ${acts.length}`);
        acts.forEach(a => console.log(`- ${a.titulo} | ${a.curso} | ${a.materia}`));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
f();
