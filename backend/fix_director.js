const sequelize = require('./config/db');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function fix() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected');

        // 1. Ensure Director exists
        const emailDir = 'director@utn.com';
        let director = await User.findOne({ where: { email: emailDir } });
        if (!director) {
            console.log('Creating Director...');
            const hash = await bcrypt.hash('director', 10);
            director = await User.create({ email: emailDir, password: hash, role: 'director' });
        } else {
            console.log('Director exists. Ensuring role is strictly "director"...');
            if (director.role !== 'director') {
                director.role = 'director';
                await director.save();
            }
        }
        console.log(`Director: ${director.email} (${director.role})`);

        // 2. Ensure at least one Professor
        const emailProf = 'profesor1@utn.com'; // Reuse the one we know works
        let prof = await User.findOne({ where: { email: emailProf } });
        if (!prof) {
            console.log('Creating Professor1...');
            const hash = await bcrypt.hash('profesor1', 10);
            prof = await User.create({ email: emailProf, password: hash, role: 'profesor' });
        } else {
            if (prof.role !== 'profesor') {
                prof.role = 'profesor';
                await prof.save();
            }
        }
        console.log(`Profesor: ${prof.email} (${prof.role})`);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
fix();
