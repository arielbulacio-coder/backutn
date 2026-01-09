const sequelize = require('./config/db');
const Alumno = require('./models/Alumno');
const HistorialAcademico = require('./models/HistorialAcademico');
const Nota = require('./models/Nota');

async function ensureJuanPerez() {
    try {
        await sequelize.authenticate();
        console.log('Conexión DB OK. Host:', sequelize.config.host);

        // 1. Crear o Buscar a Juan Pérez (Upsert)
        const [alumno, created] = await Alumno.findOrCreate({
            where: { legajo: '12345' },
            defaults: {
                nombre: 'Juan',
                apellido: 'Pérez',
                email: 'juan.perez@alumno.utn.edu.ar',
                email_padre: 'padre.perez@gmail.com',
                dni: '40123456',
                curso: '2° A' // Lo forzamos aquí si se crea
            }
        });

        // Asegurar curso correcto si ya existía
        if (!created || alumno.curso !== '2° A') {
            await alumno.update({ curso: '2° A' });
            console.log('Alumno actualizado a curso 2° A');
        } else {
            console.log('Alumno creado en curso 2° A');
        }

        // 2. Cargar Trayectoria (Año Anterior: 1° A - 2025)
        await HistorialAcademico.destroy({ where: { AlumnoId: alumno.id } });

        await HistorialAcademico.create({
            ciclo_lectivo: 2025,
            curso: '1° A',
            condicion: 'promovido',
            promedio_general: 8.50,
            observaciones: 'Excelente compañero. Destacado en Taller.',
            AlumnoId: alumno.id
        });
        console.log('Trayectoria 2025 cargada.');

        // 3. Cargar Notas Actuales (2° A - 2026)
        await Nota.destroy({ where: { AlumnoId: alumno.id } });

        const materias2do = [
            'Matemática II', 'Física II', 'Lengua y Literatura II', 'Inglés II',
            'Historia', 'Geografía', 'Taller Pre-Profesional', 'Dibujo Técnico'
        ];

        const notas = materias2do.map(materia => ({
            AlumnoId: alumno.id,
            materia: materia,
            // 1er Trimestre (Completos y buenos)
            t1_p1: (Math.random() * 1.5 + 8).toFixed(2),
            t1_p2: (Math.random() * 1.5 + 8).toFixed(2),
            t1_p3: (Math.random() * 1.5 + 8).toFixed(2),
            // 2do Trimestre (En curso, parciales)
            t2_p1: (Math.random() * 2 + 7).toFixed(2),
            t2_p2: null,
            t2_p3: null,
            // 3er Trimestre (Vacío)
            t3_p1: null, t3_p2: null, t3_p3: null
        }));

        await Nota.bulkCreate(notas);
        console.log(`Notas cargadas para ${materias2do.length} materias de 2° Año.`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

ensureJuanPerez();
