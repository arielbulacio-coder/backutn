const sequelize = require('./config/db');
const User = require('./models/User');
const ProfesorMateria = require('./models/ProfesorMateria');

async function debugProfessor() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected');

        const email = 'profesor1@utn.com';

        // 1. Check User
        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.log(`❌ User ${email} NOT FOUND in Users table.`);
        } else {
            console.log(`✅ User found: ID=${user.id}, Role=${user.role}, Email=${user.email}`);
        }

        // 2. Check Assignments
        const asignaciones = await ProfesorMateria.findAll({ where: { email_profesor: email } });
        console.log(`Found ${asignaciones.length} assignments for ${email}:`);
        asignaciones.forEach(a => {
            console.log(` - ${a.curso} | ${a.materia} | Ciclo: ${a.ciclo_lectivo}`);
        });

        if (asignaciones.length === 0) {
            console.log('⚠ No asignaciones found. Attempting to force create one...');
            await ProfesorMateria.create({
                email_profesor: email,
                curso: '6o 2a',
                materia: 'Matemática',
                ciclo_lectivo: 2026 // Usando año actual hardcodeado por seguridad si la logica de fecha falla
            });
            await ProfesorMateria.create({
                email_profesor: email,
                curso: '6o 2a',
                materia: 'Física',
                ciclo_lectivo: 2026
            });
            console.log('✅ Forced creation of 6o 2a Matemática/Física (2026).');
        }

        process.exit(0);
    } catch (error) {
        console.error('Debug error:', error);
        process.exit(1);
    }
}

debugProfessor();
