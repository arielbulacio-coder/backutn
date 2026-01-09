const sequelize = require('./config/db');
const Alumno = require('./models/Alumno');
const HistorialAcademico = require('./models/HistorialAcademico');
const Nota = require('./models/Nota');

async function seedTrayectoria() {
    try {
        await sequelize.authenticate();
        console.log('Conexión establecida con la base de datos.');

        // 1. Crear o Buscar un Alumno de Prueba
        const [alumno, created] = await Alumno.findOrCreate({
            where: { legajo: '12345' },
            defaults: {
                nombre: 'Juan',
                apellido: 'Pérez',
                email: 'juan.perez@alumno.utn.edu.ar',
                email_padre: 'padre.perez@gmail.com',
                curso: '4° A',
                dni: '40123456'
            }
        });

        console.log(created ? 'Alumno creado:' : 'Alumno encontrado:', alumno.nombre + ' ' + alumno.apellido);

        // 2. Limpiar Historial previo para no duplicar en pruebas
        await HistorialAcademico.destroy({ where: { AlumnoId: alumno.id } });

        // 3. Crear Historial Académico (Trayectoria)
        const historial = [
            {
                ciclo_lectivo: 2023,
                curso: '3° A',
                condicion: 'promovido',
                promedio_general: 8.5,
                observaciones: 'Excelente desempeño en taller.',
                AlumnoId: alumno.id
            },
            {
                ciclo_lectivo: 2022,
                curso: '2° B',
                condicion: 'promovido',
                promedio_general: 7.2,
                observaciones: 'Adeudó Matemática hasta diciembre.',
                AlumnoId: alumno.id
            },
            {
                ciclo_lectivo: 2021,
                curso: '1° B',
                condicion: 'promovido',
                promedio_general: 7.8,
                observaciones: 'Sin observaciones.',
                AlumnoId: alumno.id
            }
        ];

        await HistorialAcademico.bulkCreate(historial);
        console.log('Trayectoria académica cargada (3 años).');

        // 4. Cargar Notas del ciclo actual (4° A)
        // Materias típicas de 4to
        const materias = [
            'Matemática', 'Lengua y Literatura', 'Inglés', 'Física',
            'Electrónica I', 'Taller de Electrónica I', 'Sistemas Digitales I'
        ];

        // Limpiar notas previas
        await Nota.destroy({ where: { AlumnoId: alumno.id } });

        const notas = materias.map(materia => ({
            AlumnoId: alumno.id,
            materia: materia,
            // 1er Trimestre
            t1_p1: (Math.random() * 3 + 7).toFixed(2), // 7-10
            t1_p2: (Math.random() * 3 + 7).toFixed(2),
            t1_p3: (Math.random() * 3 + 7).toFixed(2),
            // 2do Trimestre
            t2_p1: (Math.random() * 4 + 6).toFixed(2), // 6-10
            t2_p2: (Math.random() * 4 + 6).toFixed(2),
            t2_p3: (Math.random() * 4 + 6).toFixed(2),
            // 3er Trimestre (algunas vacías para simular en curso)
            t3_p1: (Math.random() * 5 + 5).toFixed(2), // 5-10
            t3_p2: null,
            t3_p3: null
        }));

        await Nota.bulkCreate(notas);
        console.log(`Notas cargadas para ${materias.length} materias del ciclo actual.`);

        console.log('¡Datos de prueba cargados exitosamente!');

    } catch (error) {
        console.error('Error al cargar datos:', error);
    } finally {
        // await sequelize.close(); // No cerrar si se corre con nodemon o similar, pero aquí es script one-off
        process.exit();
    }
}

seedTrayectoria();
