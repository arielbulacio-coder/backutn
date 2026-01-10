const sequelize = require('./config/db');
const User = require('./models/User');
const ProfesorMateria = require('./models/ProfesorMateria');
const bcrypt = require('bcryptjs'); // Assuming bcryptjs is installed, or just store plain text for debugging if needed but better hash

async function run() {
    try {
        await sequelize.authenticate();
        console.log('--- DB CONNECTED ---');

        const email = 'profesor1@utn.com';

        // 1. Ensure User
        let user = await User.findOne({ where: { email } });
        if (!user) {
            console.log('Creating User...');
            const hashedPassword = await bcrypt.hash('profesor1', 10);
            user = await User.create({
                email,
                password: hashedPassword,
                role: 'profesor'
            });
            console.log('User Created with ID:', user.id);
        } else {
            console.log('User Exists with ID:', user.id);
        }

        // 2. Clear existing assignments to be sure
        await ProfesorMateria.destroy({ where: { email_profesor: email } });
        console.log('Cleared old assignments.');

        // 3. Create Assignments
        const assignments = [
            { curso: '6o 2a', materia: 'Matemática' },
            { curso: '6o 2a', materia: 'Física' },
            { curso: '5o 1a', materia: 'ELECTRÓNICA APLICADA' }
        ];

        for (const a of assignments) {
            await ProfesorMateria.create({
                email_profesor: email,
                curso: a.curso,
                materia: a.materia,
                ciclo_lectivo: 2026 // Ensure this matches current year
            });
            console.log(`Created: ${a.curso} - ${a.materia}`);
        }

        // 4. Verification
        const check = await ProfesorMateria.findAll({ where: { email_profesor: email } });
        console.log(`\nVERIFICATION: Found ${check.length} assignments.`);
        check.forEach(c => console.log(` -> ${c.curso} : ${c.materia}`));

        process.exit(0);
    } catch (e) {
        console.error('ERROR:', e);
        process.exit(1);
    }
}

run();
