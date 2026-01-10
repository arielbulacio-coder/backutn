const { Sequelize } = require('sequelize');
const { sequelize, ProfesorMateria } = require('./index'); // Adjust import based on your structure

const assignData = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Profesor de prueba
        const emailProfesor = 'profesor1@utn.com'; // Asegúrate de que este usuario exista

        // Datos a asignar (Curso - Materia)
        const asignaciones = [
            { curso: '6o 2a', materia: 'Matemática' },
            { curso: '6o 2a', materia: 'Física' },
            { curso: '5o 1a', materia: 'ELECTRÓNICA APLICADA' },
            { curso: '7o 1a', materia: 'PRÁCTICAS PROFESIONALIZANTES' }
        ];

        console.log(`Asignando materias a ${emailProfesor}...`);

        for (const asignacion of asignaciones) {
            // Verificar si ya existe para no duplicar
            const exists = await ProfesorMateria.findOne({
                where: {
                    email_profesor: emailProfesor,
                    curso: asignacion.curso,
                    materia: asignacion.materia
                }
            });

            if (!exists) {
                await ProfesorMateria.create({
                    email_profesor: emailProfesor,
                    curso: asignacion.curso,
                    materia: asignacion.materia,
                    ciclo_lectivo: new Date().getFullYear()
                });
                console.log(`+ Asignada: ${asignacion.materia} en ${asignacion.curso}`);
            } else {
                console.log(`= Ya existe: ${asignacion.materia} en ${asignacion.curso}`);
            }
        }

        console.log('Proceso finalizado.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

assignData();
