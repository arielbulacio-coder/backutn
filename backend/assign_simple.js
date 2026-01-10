const sequelize = require('./config/db');
const ProfesorMateria = require('./models/ProfesorMateria');

async function assign() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected');

        const email = 'profesor1@utn.com';
        const ciclo = 2024; // Use hardcoded year or getFullYear()
        // Override with current year if needed, but keeping it consistent with valid test data

        // Assignments data
        const data = [
            { email_profesor: email, curso: '6o 2a', materia: 'Matemática', ciclo_lectivo: 2026 },
            { email_profesor: email, curso: '6o 2a', materia: 'Física', ciclo_lectivo: 2026 },
            { email_profesor: email, curso: '5o 1a', materia: 'ELECTRÓNICA APLICADA', ciclo_lectivo: 2026 },
            { email_profesor: email, curso: '7o 1a', materia: 'PRÁCTICAS PROFESIONALIZANTES', ciclo_lectivo: 2026 }
        ];

        console.log('Deleting old assignments...');
        await ProfesorMateria.destroy({ where: { email_profesor: email } });

        console.log('Creating new assignments...');
        // Using bulkCreate for speed/atomicity
        await ProfesorMateria.bulkCreate(data);

        console.log('DONE. Assignments created.');
        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

assign();
