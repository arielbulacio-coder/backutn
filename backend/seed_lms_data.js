const { sequelize, User, Alumno, Material, Actividad, Entrega, ProfesorMateria } = require('./index');

const seedLMS = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const ciclo = new Date().getFullYear();

        // 1. Ensure Professor Exists
        const emailProfesor = 'profesor1@utn.com';
        console.log(`Checking professor ${emailProfesor}...`);

        // (Assuming user creation is handled by create_profiles.js or similar, checking existence here)
        // If you need to create user: 
        // await User.findOrCreate(...) 

        // 2. Ensure Assignments (Repeating assign_test_data logic efficiently)
        const assignments = [
            { curso: '6o 2a', materia: 'Matemática' },
            { curso: '6o 2a', materia: 'Física' },
            { curso: '5o 1a', materia: 'ELECTRÓNICA APLICADA' }
        ];

        for (const a of assignments) {
            const [assign, created] = await ProfesorMateria.findOrCreate({
                where: { email_profesor: emailProfesor, curso: a.curso, materia: a.materia, ciclo_lectivo: ciclo },
                defaults: { email_profesor: emailProfesor, curso: a.curso, materia: a.materia, ciclo_lectivo: ciclo }
            });
            if (created) console.log(`+ Assigned ${a.materia} in ${a.curso}`);
        }

        // 3. Create Materials
        console.log('Seeding Materials...');
        const materialsData = [
            {
                titulo: 'Programa de la Materia',
                descripcion: 'Contenidos y planificación anual.',
                curso: '6o 2a', materia: 'Matemática',
                tipo: 'pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                trimestre: 1, unidad: 'General'
            },
            {
                titulo: 'Introducción a Funciones',
                descripcion: 'Conceptos básicos de funciones lineales y cuadráticas.',
                curso: '6o 2a', materia: 'Matemática',
                tipo: 'texto',
                trimestre: 1, unidad: 'Unidad 1'
            },
            {
                titulo: 'Video: Derivadas',
                descripcion: 'Explicación gráfica de la derivada.',
                curso: '6o 2a', materia: 'Matemática',
                tipo: 'youtube', url: 'https://www.youtube.com/watch?v=EXAMPLE_ID',
                trimestre: 2, unidad: 'Unidad 2'
            },
            {
                titulo: 'Guía de Ejercicios Física I',
                descripcion: 'Ejercicios de cinemática.',
                curso: '6o 2a', materia: 'Física',
                tipo: 'pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                trimestre: 1, unidad: 'Cinemática'
            },
            {
                titulo: 'Simulador de Circuitos',
                descripcion: 'Enlace al simulador online.',
                curso: '5o 1a', materia: 'ELECTRÓNICA APLICADA',
                tipo: 'link', url: 'https://www.falstad.com/circuit/',
                trimestre: 1, unidad: 'Laboratorio'
            }
        ];

        for (const m of materialsData) {
            await Material.findOrCreate({
                where: { titulo: m.titulo, curso: m.curso, materia: m.materia },
                defaults: { ...m, ciclo_lectivo: ciclo, visible: true }
            });
        }

        // 4. Create Activities
        console.log('Seeding Activities...');
        const activitiesData = [
            {
                titulo: 'TP 1: Funciones',
                descripcion: 'Resolver los ejercicios 1 a 10 de la guía.',
                curso: '6o 2a', materia: 'Matemática',
                fecha_entrega: '2024-04-15',
                trimestre: 1, unidad: 'Unidad 1'
            },
            {
                titulo: 'TP 2: Análisis de Gráficos',
                descripcion: 'Analizar las siguientes funciones...',
                curso: '6o 2a', materia: 'Matemática',
                fecha_entrega: '2024-05-20',
                trimestre: 1, unidad: 'Unidad 1'
            },
            {
                titulo: 'Informe de Laboratorio',
                descripcion: 'Presentar informe sobre la práctica de transistores.',
                curso: '5o 1a', materia: 'ELECTRÓNICA APLICADA',
                fecha_entrega: '2024-06-10',
                trimestre: 1, unidad: 'Transistores'
            }
        ];

        const createdActivities = [];
        for (const act of activitiesData) {
            const [record, created] = await Actividad.findOrCreate({
                where: { titulo: act.titulo, curso: act.curso, materia: act.materia },
                defaults: { ...act, ciclo_lectivo: ciclo, visible: true }
            });
            createdActivities.push(record);
        }

        // 5. Create Submissions (Entregas) for alumno1
        console.log('Seeding Submissions...');
        const alumnoInfo = await Alumno.findOne({ where: { curso: '6o 2a' } }); // Find any student in 6o 2a

        if (alumnoInfo) {
            const mathActivity = createdActivities.find(a => a.materia === 'Matemática' && a.titulo === 'TP 1: Funciones');

            if (mathActivity) {
                await Entrega.findOrCreate({
                    where: { ActividadId: mathActivity.id, AlumnoId: alumnoInfo.id },
                    defaults: {
                        archivo_url: 'https://docs.google.com/document/d/example',
                        comentario: 'Adjunto mi trabajo práctico profer.',
                        fecha: new Date(),
                        ciclo_lectivo: ciclo,
                        // Let's mimic a graded one
                        calificacion: 8.5,
                        devolucion: 'Muy buen trabajo, revisar punto 3.'
                    }
                });
                console.log(`+ Submission created for student ${alumnoInfo.nombre} in activity ${mathActivity.titulo}`);
            }
        } else {
            console.log('No student found in 6o 2a to assign submissions.');
        }

        console.log('LMS Data seeding completed successfully.');
        process.exit(0);

    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedLMS();
