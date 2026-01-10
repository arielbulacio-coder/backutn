const sequelize = require('./config/db');
const User = require('./models/User');

async function checkUsers() {
    try {
        await sequelize.authenticate();
        console.log('Connected');
        const users = await User.findAll();
        console.log('--- Relevant Users ---');
        users.forEach(u => {
            if (['admin', 'director', 'profesor'].includes(u.role)) {
                console.log(`ID: ${u.id} | Email: ${u.email} | Role: '${u.role}'`);
            }
        });
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkUsers();
