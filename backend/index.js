const express = require('express');
require('dotenv').config();
const cors = require('cors');
const sequelize = require('./config/db');
const Alumno = require('./models/Alumno');
const Nota = require('./models/Nota');
const User = require('./models/User');
const authRoutes = require('./routes/auth');
const verifyToken = require('./middleware/authMiddleware');

const app = express();
app.use(cors());
app.use(express.json());
app.get('/ping', (req, res) => res.send('pong'));
app.get('/version', (req, res) => res.json({ version: '1.2.0', timestamp: new Date().toISOString() }));
app.get('/debug/users', async (req, res) => {
    try {
        const counts = await User.findAll({
            attributes: ['role', [sequelize.fn('COUNT', sequelize.col('role')), 'count']],
            group: ['role']
        });
        res.json(counts);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

const Asistencia = require('./models/Asistencia');
const Material = require('./models/Material');
const Actividad = require('./models/Actividad');
const Entrega = require('./models/Entrega');
const CicloLectivo = require('./models/CicloLectivo');
const Curso = require('./models/Curso');
const Materia = require('./models/Materia');
const MateriaCurso = require('./models/MateriaCurso');
const HistorialAcademico = require('./models/HistorialAcademico');
const ProfesorMateria = require('./models/ProfesorMateria');
const Comunicado = require('./models/Comunicado');
const LibroTema = require('./models/LibroTema');
const authorize = require('./middleware/roleMiddleware');

// Establecer Relaciones
Alumno.hasMany(Nota, { as: 'Notas' });
Nota.belongsTo(Alumno);

Alumno.hasMany(Asistencia, { as: 'Asistencias' });
Asistencia.belongsTo(Alumno);

Actividad.hasMany(Entrega);
Entrega.belongsTo(Actividad);
Alumno.hasMany(Entrega);
Entrega.belongsTo(Alumno);

Alumno.hasMany(HistorialAcademico, { as: 'Historial' });
HistorialAcademico.belongsTo(Alumno);

const bcrypt = require('bcryptjs');

// Sincronizar Base de Datos
// Usamos sync() - En producción usar migraciones. Aquí alter: true para agregar columnas nuevas
sequelize.sync({ alter: true }).then(async () => {
    console.log('Tablas sincronizadas (alter: true)');
    await seedAcademicData(); // Ensure courses/subjects exist

    // Inicializar Ciclo Lectivo actual si no existe
    const anioActual = new Date().getFullYear();
    const existe = await CicloLectivo.findOne({ where: { anio: anioActual } });
    if (!existe) {
        await CicloLectivo.create({
            anio: anioActual,
            activo: true,
            fecha_inicio: `${anioActual}-03-01`,
            fecha_fin: `${anioActual}-12-15`
        });
        console.log(`Ciclo lectivo ${anioActual} inicializado.`);
    }

    // Crear usuario admin por defecto si no existe ninguno
    try {
        const adminEmail = 'arielbulacio@gmail.com';
        const adminExists = await User.findOne({ where: { email: adminEmail } });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('ariel2027', 10);
            await User.create({
                email: adminEmail,
                password: hashedPassword,
                role: 'admin'
            });
            console.log(`Usuario admin creado por defecto: ${adminEmail} / ariel2027`);
        }

        // Test Director Creation
        const dirEmail = 'director@utn.com';
        const dirExists = await User.findOne({ where: { email: dirEmail } });
        if (!dirExists) {
            const hash = await bcrypt.hash('director', 10);
            await User.create({ email: dirEmail, password: hash, role: 'director' });
            console.log('Usuario DIRECTOR creado exitosamente.');
        } else {
            console.log('Usuario DIRECTOR ya existe.');
        }

    } catch (error) {
        console.error('Error al crear usuarios iniciales:', error);
    }
}).catch(err => console.log('Error al sincronizar:', err));

// Rutas de Autenticación
app.use('/', authRoutes);

// --- PERFIL DE USUARIO ---
app.put('/perfil', verifyToken, async (req, res) => {
    try {
        const { foto, telefono, bio, intereses } = req.body;
        const user = await User.findByPk(req.user.id);

        if (foto !== undefined) user.foto = foto;
        if (telefono !== undefined) user.telefono = telefono;
        if (bio !== undefined) user.bio = bio;
        if (intereses !== undefined) user.intereses = intereses;

        await user.save();
        res.json({ message: 'Perfil actualizado', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- GESTIÓN DE CURSOS Y MATERIAS (ADMIN/DIRECTOR) ---

// CURSOS
app.get('/cursos', async (req, res) => {
    try {
        const cursos = await Curso.findAll({ order: [['nombre', 'ASC']] });
        res.json(cursos);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/cursos', verifyToken, authorize(['admin', 'director']), async (req, res) => {
    try {
        const { nombre } = req.body;
        const nuevo = await Curso.create({ nombre });
        res.status(201).json(nuevo);
    } catch (error) { res.status(400).json({ error: error.message }); }
});

app.put('/cursos/:id', verifyToken, authorize(['admin', 'director']), async (req, res) => {
    try {
        const { nombre } = req.body;
        await Curso.update({ nombre }, { where: { id: req.params.id } });
        res.json({ message: 'Curso actualizado' });
    } catch (error) { res.status(400).json({ error: error.message }); }
});

app.delete('/cursos/:id', verifyToken, authorize(['admin', 'director']), async (req, res) => {
    try {
        await Curso.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Curso eliminado' });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// MATERIAS
app.get('/materias', async (req, res) => {
    try {
        const materias = await Materia.findAll({ order: [['nombre', 'ASC']] });
        res.json(materias);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/materias', verifyToken, authorize(['admin', 'director']), async (req, res) => {
    try {
        const { nombre } = req.body;
        const nueva = await Materia.create({ nombre });
        res.status(201).json(nueva);
    } catch (error) { res.status(400).json({ error: error.message }); }
});

app.put('/materias/:id', verifyToken, authorize(['admin', 'director']), async (req, res) => {
    try {
        const { nombre } = req.body;
        await Materia.update({ nombre }, { where: { id: req.params.id } });
        res.json({ message: 'Materia actualizada' });
    } catch (error) { res.status(400).json({ error: error.message }); }
});

app.delete('/materias/:id', verifyToken, authorize(['admin', 'director']), async (req, res) => {
    try {
        await Materia.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Materia eliminada' });
    } catch (error) { res.status(500).json({ error: error.message }); }
});


// --- GESTIÓN DE PLAN DE ESTUDIOS (MATERIAS POR AÑO) ---
app.get('/curricula', async (req, res) => {
    try {
        const curricula = await MateriaCurso.findAll({ order: [['anio', 'ASC']] });
        res.json(curricula);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/curricula', verifyToken, authorize(['admin', 'director', 'vicedirector']), async (req, res) => {
    try {
        const { anio, materia } = req.body;
        // Evitar duplicados
        const existe = await MateriaCurso.findOne({ where: { anio, materia, ciclo_lectivo: new Date().getFullYear() } });
        if (existe) return res.status(400).json({ message: 'Materia ya asignada a este año.' });

        const nuevo = await MateriaCurso.create({ anio, materia });
        res.status(201).json(nuevo);
    } catch (error) { res.status(400).json({ error: error.message }); }
});

app.delete('/curricula/:id', verifyToken, authorize(['admin', 'director', 'vicedirector']), async (req, res) => {
    try {
        await MateriaCurso.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Asignación curricular eliminada' });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// Endpoint especial para generar/crear curso estructurado
app.post('/cursos/generar', verifyToken, authorize(['admin', 'director']), async (req, res) => {
    try {
        const { anio, division } = req.body;
        const nombre = `${anio}° ${division}`;

        let curso = await Curso.findOne({ where: { nombre } });
        if (curso) return res.status(400).json({ message: 'El curso ya existe.' });

        curso = await Curso.create({ nombre, anio, division });
        res.status(201).json(curso);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- SEED AUTOMÁTICO DE CURSOS/MATERIAS SI VACÍO ---
const seedAcademicData = async () => {
    try {
        const cCount = await Curso.count();
        if (cCount === 0) {
            await Curso.bulkCreate([
                { nombre: '1A' }, { nombre: '1B' }, { nombre: '2A' }, { nombre: '2B' },
                { nombre: '3A' }, { nombre: '4o 1a' }, { nombre: '5o 1a' }, { nombre: '6o 2a' }, { nombre: '7o 1a' }
            ]);
            console.log('Cursos iniciales creados.');
        }
        const mCount = await Materia.count();
        if (mCount === 0) {
            await Materia.bulkCreate([
                { nombre: 'Matemática' }, { nombre: 'Lengua' }, { nombre: 'Física' },
                { nombre: 'Química' }, { nombre: 'Inglés' }, { nombre: 'Historia' },
                { nombre: 'Electrónica Aplicada' }, { nombre: 'Sistemas Digitales' },
                { nombre: 'Máquinas Eléctricas' }, { nombre: 'Seguridad e Higiene' },
                { nombre: 'Prácticas Profesionalizantes' }
            ]);
            console.log('Materias iniciales creadas.');
        }
    } catch (e) {
        console.error('Seed academic error:', e);
    }
};

// --- GESTIÓN DE USUARIOS (ADMIN) ---
app.get('/users', verifyToken, authorize(['admin', 'director', 'secretario']), async (req, res) => {
    try {
        const users = await User.findAll({ attributes: { exclude: ['password'] } });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- SEED DE DATOS DE PRUEBA ---
app.post('/test/fix-juan', verifyToken, authorize(['admin']), async (req, res) => {
    try {
        console.log('Ejecutando Fix Juan Perez (2A) - SOLO ACADEMICO...');

        // 1. Crear o Buscar a Juan Pérez (Upsert)
        const [alumno, created] = await Alumno.findOrCreate({
            where: { legajo: '12345' },
            defaults: {
                nombre: 'Juan',
                apellido: 'Pérez',
                email: 'juan.perez@alumno.utn.edu.ar',
                email_padre: 'padre.perez@gmail.com',
                dni: '40123456',
                curso: '2A'
            }
        });

        // Asegurar curso correcto
        if (!created || alumno.curso !== '2A') {
            await alumno.update({ curso: '2A' });
        }

        // 2. Cargar Trayectoria (Año Anterior: 1° A - 2025)
        await HistorialAcademico.destroy({ where: { AlumnoId: alumno.id } });

        await HistorialAcademico.create({
            ciclo_lectivo: 2025,
            curso: '1A',
            condicion: 'promovido',
            promedio_general: 8.50,
            observaciones: 'Excelente compañero. Destacado en Taller.',
            AlumnoId: alumno.id
        });

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
            t3_p1: null, t3_p2: null, t3_p3: null,
            // Finales provisionales vacíos
            final_cursada: null
        }));

        await Nota.bulkCreate(notas);

        res.json({
            message: 'Juan Pérez actualizado a 2° A con trayectoria y notas (SIN USUARIOS).',
            alumno: alumno.nombre + ' ' + alumno.apellido,
            curso: alumno.curso
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/test/seed', verifyToken, authorize(['admin']), async (req, res) => {
    try {
        console.log('Seeding general data... REDEPLOY FIX');
        const passwordHash = await bcrypt.hash('123456', 10);

        // 1. Usuarios Básicos (si no existen)
        const usersData = [
            { email: 'profesor@utn.com', role: 'profesor' },
            { email: 'preceptor@utn.com', role: 'preceptor' },
            { email: 'director@utn.com', role: 'director' },
            { email: 'alumno1@utn.com', role: 'alumno' }, // Juan Perez ya tiene su user
            { email: 'padre1@utn.com', role: 'padre' },
        ];

        for (const u of usersData) {
            await User.findOrCreate({
                where: { email: u.email },
                defaults: { password: passwordHash, role: u.role }
            });
        }

        // 2. Alumnos de Relleno
        const alumnosData = [
            { nombre: 'Juan', apellido: 'Pérez', email: 'alumno1@utn.com', legajo: 'L001', curso: '2A', email_padre: 'padre1@utn.com', dni: '40123456' },
            { nombre: 'Maria', apellido: 'Lopez', email: 'maria@utn.com', legajo: 'L002', curso: '1A', email_padre: 'padre2@utn.com', dni: '40000002' },
            { nombre: 'Carlos', apellido: 'Gomez', email: 'carlos@utn.com', legajo: 'L003', curso: '2B', email_padre: 'padre3@utn.com', dni: '40000003' },
            { nombre: 'Sofia', apellido: 'Martinez', email: 'sofia@utn.com', legajo: 'L004', curso: '2A', email_padre: 'padre4@utn.com', dni: '40000004' },
            { nombre: 'Lucas', apellido: 'Rodriguez', email: 'lucas@utn.com', legajo: 'L005', curso: '3C', email_padre: 'padre5@utn.com', dni: '40000005' }
        ];

        let createdCount = 0;
        for (const a of alumnosData) {
            const [alumno, created] = await Alumno.findOrCreate({
                where: { legajo: a.legajo },
                defaults: a
            });
            if (!created) await alumno.update(a); // Update course/email if changed
            if (created) createdCount++;

            // Si es Juan Perez, cargarle trayectoria también
            if (alumno.legajo === 'L001') {
                await HistorialAcademico.destroy({ where: { AlumnoId: alumno.id } });
                await HistorialAcademico.create({
                    ciclo_lectivo: 2025,
                    curso: '1A',
                    condicion: 'promovido',
                    promedio_general: 8.50,
                    observaciones: 'Excelente desempeño en ciclo anterior.',
                    AlumnoId: alumno.id
                });
            }

            // Crear notas random para estos alumnos
            await Nota.destroy({ where: { AlumnoId: alumno.id } });

            const materias = ['Matemática', 'Lengua', 'Física', 'Historia', 'Inglés'];
            const notas = materias.map(m => ({
                AlumnoId: alumno.id,
                materia: m,
                ciclo_lectivo: 2026,
                t1_p1: (Math.random() * 2 + 7).toFixed(2),
                t1_p2: (Math.random() * 2 + 7).toFixed(2),
                t1_p3: (Math.random() * 2 + 7).toFixed(2),
                t2_p1: (Math.random() * 3 + 6).toFixed(2),
                t2_p2: (Math.random() * 3 + 6).toFixed(2),
                t2_p3: null, // En curso
                t3_p1: null,
                final_cursada: null
            }));
            await Nota.bulkCreate(notas);

            // Si es Juan Perez, cargarle TAMBIEN notas de 2025 completas
            if (alumno.legajo === 'L001') {
                const notas2025 = materias.map(m => ({
                    AlumnoId: alumno.id,
                    materia: m,
                    ciclo_lectivo: 2025, // Ciclo anterior
                    t1_p1: 8, t1_p2: 9, t1_p3: 8,
                    t2_p1: 7, t2_p2: 8, t2_p3: 8,
                    t3_p1: 9, t3_p2: 9, t3_p3: 10,
                    final_cursada: 9
                }));
                await Nota.bulkCreate(notas2025);
            }
        }

        // 4. Materiales y Actividades de prueba (LMS) - Para VARIOS CURSOS
        await Material.destroy({ where: {} }); // Limpiar todo LMS para evitar duplicados
        await Actividad.destroy({ where: {} });

        const cursosSeed = ['1A', '2A', '2B'];
        const materiasSeed = ['Matemática', 'Física', 'Historia', 'Inglés', 'Taller'];

        for (const curso of cursosSeed) {
            for (const mat of materiasSeed) {
                // MATERIALES
                await Material.create({
                    titulo: `Introducción a ${mat}`,
                    descripcion: `Material fundamental para el curso de ${mat}.`,
                    curso: curso, materia: mat, tipo: 'pdf',
                    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
                });
                await Material.create({
                    titulo: `Guía Práctica ${mat} - Parte 1`,
                    descripcion: `Ejercicios resueltos de ${mat}.`,
                    curso: curso, materia: mat, tipo: 'youtube',
                    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
                });

                // ACTIVIDADES
                await Actividad.create({
                    titulo: `TP 1: Conceptos de ${mat}`,
                    descripcion: `Resolver cuestionario sobre la unidad 1 de ${mat}.`,
                    curso: curso, materia: mat,
                    fecha_entrega: '2026-04-15'
                });
                await Actividad.create({
                    titulo: `Proyecto Grupal ${mat}`,
                    descripcion: `Investigación y presentación sobre ${mat}.`,
                    curso: curso, materia: mat,
                    fecha_entrega: '2026-05-20'
                });
            }
        }

        // 5. Asistencias de prueba (últimos 5 días)
        const asistencias = [];
        const alumnos = await Alumno.findAll();
        const hoy = new Date();

        for (let i = 0; i < 5; i++) {
            const fecha = new Date();
            fecha.setDate(hoy.getDate() - i);
            const fechaStr = fecha.toISOString().split('T')[0];

            for (const alu of alumnos) {
                // Random status
                const estados = ['presente', 'presente', 'presente', 'ausente', 'tarde'];
                const estado = estados[Math.floor(Math.random() * estados.length)];

                asistencias.push({
                    AlumnoId: alu.id,
                    fecha: fechaStr,
                    estado: estado,
                    observacion: estado === 'ausente' ? 'Gripe' : ''
                });
            }
        }
        await Asistencia.bulkCreate(asistencias);

        res.json({
            message: 'Seed COMPLETO: Usuarios, Alumnos, Notas, LMS (Materiales/Actividaes) y Asistencias.',
            version: 'v2-with-2025',
            alumnos_count: alumnos.length,
            lms_items: cursosSeed.length * materiasSeed.length * 4,
            asistencias_generadas: asistencias.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api-debug', async (req, res) => {
    try {
        const uCount = await User.count();
        const aCount = await Alumno.count();
        const nCount = await Nota.count();
        const mCount = await Material.count();
        const actCount = await Actividad.count();
        res.json({
            status: 'online',
            users: uCount,
            alumnos: aCount,
            notas: nCount,
            materiales: mCount,
            actividades: actCount,
            time: new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- RUTAS DE ALUMNOS ---
// Crear alumno: Solo Director, Secretario, Jefe de Preceptores, Admin
app.post('/alumnos', verifyToken, authorize(['admin', 'director', 'secretario', 'jefe_preceptores']), async (req, res) => {
    try {
        const nuevoAlumno = await Alumno.create(req.body);
        res.status(201).json(nuevoAlumno);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Listar alumnos: Solo Personal académico y administrativo (admin, director, prof, preceptor, etc)
app.get('/alumnos', verifyToken, authorize(['admin', 'director', 'secretario', 'jefe_preceptores', 'preceptor', 'profesor']), async (req, res) => {
    try {
        const { ciclo_lectivo } = req.query;
        // Si no se especifica ciclo, por defecto trae TODO (pero para cargar notas del año actual convendría filtrar)
        // Para no romper compatibilidad, si viene el param filtramos, si no, todo (o default current year?)
        // Vamos a filtrar solo si viene el query param

        const notasWhere = ciclo_lectivo ? { ciclo_lectivo } : undefined;
        // Asistencia tb tiene ciclo_lectivo? Asumimos que sí por modelo, si no usar fecha year
        // El modelo Asistencias no tenia ciclo, pero se puede filtrar por fecha 
        // Update: Asistencia model TIENE ciclo_lectivo en la definicion actual.

        const lista = await Alumno.findAll({
            include: [
                {
                    model: Nota,
                    as: 'Notas',
                    where: notasWhere,
                    required: false
                },
                {
                    model: Asistencia,
                    as: 'Asistencias',
                    // where: ciclo_lectivo ? { ciclo_lectivo } : undefined, // Si Asistencia model has it
                    required: false
                },
                { model: HistorialAcademico, as: 'Historial' }
            ]
        });
        res.json(lista);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener boletín propio (para alumno) o de hijo (para padre) - SEGURO
app.get('/boletin', verifyToken, authorize(['alumno', 'padre', 'admin']), async (req, res) => {
    try {
        const userEmail = req.user.email; // extraído de verifyToken (req.user contiene el payload del JWT)

        let alumno;
        if (req.user.role === 'alumno') {
            alumno = await Alumno.findOne({
                where: { email: userEmail },
                include: [
                    {
                        model: Nota,
                        as: 'Notas',
                        where: req.query.ciclo_lectivo ? { ciclo_lectivo: req.query.ciclo_lectivo } : undefined,
                        required: false
                    },
                    {
                        model: Asistencia,
                        as: 'Asistencias',
                        where: req.query.ciclo_lectivo ? { ciclo_lectivo: req.query.ciclo_lectivo } : undefined,
                        required: false
                    },
                    { model: HistorialAcademico, as: 'Historial' }
                ]
            });
        } else if (req.user.role === 'padre') {
            alumno = await Alumno.findOne({
                where: { email_padre: userEmail },
                include: [
                    {
                        model: Nota,
                        as: 'Notas',
                        where: req.query.ciclo_lectivo ? { ciclo_lectivo: req.query.ciclo_lectivo } : undefined,
                        required: false
                    },
                    {
                        model: Asistencia,
                        as: 'Asistencias',
                        where: req.query.ciclo_lectivo ? { ciclo_lectivo: req.query.ciclo_lectivo } : undefined,
                        required: false
                    },
                    { model: HistorialAcademico, as: 'Historial' }
                ]
            });
        } else {
            // Admin can see any? For now just as safeguard
            alumno = await Alumno.findOne({
                include: [
                    { model: Nota, as: 'Notas' },
                    { model: Asistencia, as: 'Asistencias' },
                    { model: HistorialAcademico, as: 'Historial' }
                ]
            });
        }

        if (!alumno) {
            return res.status(404).json({ message: 'No se encontró información del alumno asociado.' });
        }

        res.json(alumno);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- RESTRICCIÓN DE PROFESORES ---
// Middleware helper (o función interna) para validar asignación
const validarAsignacionProfesor = async (user, curso, materia) => {
    if (user.role === 'admin' || user.role === 'director' || user.role === 'secretario') return true;
    if (user.role !== 'profesor') return false;

    // Obtener ciclo actual (o usar año actual)
    const ciclo = new Date().getFullYear();
    const asignacion = await ProfesorMateria.findOne({
        where: {
            email_profesor: user.email,
            curso: curso,
            materia: materia,
            ciclo_lectivo: ciclo
        }
    });
    return !!asignacion;
};

// Endpoint para que el profesor consulte SUS materias asignadas (para rellenar combos)
app.get('/profesor/asignaciones', verifyToken, authorize(['profesor', 'admin', 'director', 'secretario']), async (req, res) => {
    try {
        if (['admin', 'director', 'secretario'].includes(req.user.role)) {
            // Admin ve todo (o mockeamos todas las combinaciones)
            // Esto es más para UI. Retornamos todo lo asignado en el sistema
            const todas = await ProfesorMateria.findAll();
            res.json(todas);
        } else {
            const misMaterias = await ProfesorMateria.findAll({
                where: {
                    email_profesor: req.user.email,
                    ciclo_lectivo: new Date().getFullYear()
                }
            });
            res.json(misMaterias);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para asignar materias (Admin/Director)
app.post('/admin/asignar-materia', verifyToken, authorize(['admin', 'director', 'vicedirector', 'secretario']), async (req, res) => {
    try {
        const { email_profesor, curso, materia } = req.body;
        const nueva = await ProfesorMateria.create({
            email_profesor, curso, materia
        });
        res.status(201).json(nueva);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Actualizar Planificación Anual (Profesor)
app.put('/profesor/planificacion', verifyToken, authorize(['profesor', 'admin', 'director', 'vicedirector']), async (req, res) => {
    // ... (rest of the file)
    try {
        const { id, link } = req.body;
        // ID is the ProfesorMateria ID from the assignment list
        const asignacion = await ProfesorMateria.findByPk(id);

        if (!asignacion) return res.status(404).json({ error: 'Asignación no encontrada' });

        // If not admin/director, check if it belongs to logged teacher
        if (req.user.role === 'profesor' && asignacion.email_profesor !== req.user.email) {
            return res.status(403).json({ error: 'No autorizado para editar esta planificación.' });
        }

        asignacion.planificacion_url = link;
        await asignacion.save();
        res.json(asignacion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar asignación
app.delete('/admin/asignar-materia/:id', verifyToken, authorize(['admin', 'director', 'secretario']), async (req, res) => {
    try {
        await ProfesorMateria.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Asignación eliminada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener mis asignaciones (Para el profesor)
app.get('/profesor/me/asignaciones', verifyToken, authorize(['profesor', 'admin', 'director']), async (req, res) => {
    try {
        // Si es admin/director, mostrar todas (opcional, o vacio si quieren ver como profesor específico)
        // Pero el requerimiento es para que EL profesor vea SUS cursos.
        // Si es admin, devolvemos todo o dejamos que frontend maneje constantes globales.
        if (req.user.role !== 'profesor') {
            return res.json({ asignaciones: [], isAdmin: true });
        }

        const asignaciones = await ProfesorMateria.findAll({
            where: { email_profesor: req.user.email }
        });

        // Formato simplificado: { cursos: ['6o 2a'], materias: ['Matemática'] } ??
        // Mejor devolver la lista de pares curso-materia validos
        const pares = asignaciones.map(a => ({
            curso: a.curso,
            materia: a.materia,
            id: a.id
        }));

        res.json(pares);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- RUTAS DE NOTAS ---
// Cargar nota: Profesor (validado), Admin
app.post('/notas', verifyToken, authorize(['admin', 'profesor', 'director']), async (req, res) => {
    try {
        const { AlumnoId, materia, ciclo_lectivo = new Date().getFullYear(), ...grades } = req.body;

        if (!AlumnoId || !materia) {
            return res.status(400).json({ message: 'Faltan datos requeridos (AlumnoId, materia)' });
        }

        // VALIDAR PERMISO PROFESOR
        if (req.user.role === 'profesor') {
            const alumno = await Alumno.findByPk(AlumnoId);
            if (!alumno) return res.status(404).json({ message: 'Alumno no encontrado' });

            const permitido = await validarAsignacionProfesor(req.user, alumno.curso, materia);
            if (!permitido) {
                return res.status(403).json({ message: 'No tiene asignada esta materia en este curso.' });
            }
        }

        // Buscar registro por alumno, materia Y CICLO LECTIVO
        let notaRecord = await Nota.findOne({
            where: { AlumnoId, materia, ciclo_lectivo }
        });

        // Filter only allowed fields to prevent errors with extra data
        const ALLOWED_FIELDS = [
            't1_p1', 't1_p2', 't1_p3',
            't2_p1', 't2_p2', 't2_p3',
            't3_p1', 't3_p2', 't3_p3',
            'final_anual', 'recup_diciembre', 'recup_febrero', 'final_cursada'
        ];

        const filteredGrades = {};
        Object.keys(grades).forEach(key => {
            if (ALLOWED_FIELDS.includes(key)) {
                filteredGrades[key] = grades[key];
            }
        });

        if (notaRecord) {
            // Actualizar campos recibidos
            await notaRecord.update(filteredGrades);
            return res.status(200).json(notaRecord);
        } else {
            // Crear nuevo con ciclo lectivo explícito
            notaRecord = await Nota.create({ AlumnoId, materia, ciclo_lectivo, ...filteredGrades });
            return res.status(201).json(notaRecord);
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// --- RUTAS DE ASISTENCIA ---
// Tomar lista: Preceptor, Jefe, Director, Admin, Profesor
app.post('/asistencias', verifyToken, authorize(['admin', 'preceptor', 'jefe_preceptores', 'director', 'profesor']), async (req, res) => {
    try {
        // Espera un array de asistencias o una sola
        const body = Array.isArray(req.body) ? req.body : [req.body];

        // Eliminar duplicados previos para "sobrescribir" asistencia
        for (const record of body) {
            await Asistencia.destroy({
                where: {
                    AlumnoId: record.AlumnoId,
                    fecha: record.fecha
                }
            });
        }

        const nuevasAsistencias = await Asistencia.bulkCreate(body);
        res.status(201).json(nuevasAsistencias);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ... (existing routes)

app.get('/asistencias', verifyToken, async (req, res) => {
    // Si es alumno o padre, filtrar solo las suyas (Pendiente de vincular Usuario -> Alumno)
    // Por ahora devolvemos todo para roles con permiso
    if (['admin', 'director', 'preceptor', 'jefe_preceptores'].includes(req.user.role)) {
        const lista = await Asistencia.findAll({ include: Alumno });
        return res.json(lista);
    }
    res.status(403).json({ message: 'Acceso restringido' });
});

// --- RUTAS LMS (MATERIALES Y ACTIVIDADES) ---

// Reporte de Totales de Asistencias (Admin/Preceptor)
app.get('/admin/asistencias/totales', verifyToken, authorize(['admin', 'director', 'secretario', 'jefe_preceptores', 'preceptor']), async (req, res) => {
    try {
        const { curso } = req.query;
        let whereClause = {};
        if (curso) whereClause.curso = curso;

        const alumnos = await Alumno.findAll({
            where: whereClause,
            include: [{
                model: Asistencia,
                as: 'Asistencias',
                where: { ciclo_lectivo: new Date().getFullYear() },
                required: false // LEFT JOIN para traer alumnos con 0 faltas también
            }]
        });

        const reporte = alumnos.map(alu => {
            // Contamos ausentes y justificados
            const count = alu.Asistencias.filter(a => a.estado === 'ausente' || a.estado === 'justificado').length;

            return {
                id: alu.id,
                nombre: alu.nombre,
                apellido: alu.apellido,
                curso: alu.curso,
                total_inasistencias: count
            };
        });

        res.json(reporte);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- RUTAS LMS (MATERIALES Y ACTIVIDADES) ---

// Materiales
app.post('/materiales', verifyToken, authorize(['admin', 'profesor']), async (req, res) => {
    try {
        const { curso, materia } = req.body;

        // VALIDAR PERMISO
        const permitido = await validarAsignacionProfesor(req.user, curso, materia);
        if (!permitido) {
            return res.status(403).json({ message: 'No tiene asignada esta materia en este curso.' });
        }

        const material = await Material.create(req.body);
        res.status(201).json(material);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/materiales', verifyToken, async (req, res) => {
    try {
        const { curso, materia, ciclo_lectivo } = req.query;
        console.log(`GET /materiales query: curso=${curso}, materia=${materia}, ciclo=${ciclo_lectivo}`);
        const whereClause = {};
        if (curso) whereClause.curso = curso;
        if (materia) whereClause.materia = materia;
        if (ciclo_lectivo) whereClause.ciclo_lectivo = ciclo_lectivo;

        const materiales = await Material.findAll({ where: whereClause });
        console.log(`Found ${materiales.length} materiales`);
        res.json(materiales);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actividades
app.post('/actividades', verifyToken, authorize(['admin', 'profesor']), async (req, res) => {
    try {
        const { curso, materia } = req.body;

        // VALIDAR PERMISO
        const permitido = await validarAsignacionProfesor(req.user, curso, materia);
        if (!permitido) {
            return res.status(403).json({ message: 'No tiene asignada esta materia en este curso.' });
        }

        const actividad = await Actividad.create(req.body);
        res.status(201).json(actividad);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/actividades', verifyToken, async (req, res) => {
    try {
        const { curso, materia, ciclo_lectivo } = req.query;
        console.log(`GET /actividades query: curso=${curso}, materia=${materia}, ciclo=${ciclo_lectivo}`);
        const whereClause = {};
        if (curso) whereClause.curso = curso;
        if (materia) whereClause.materia = materia;
        if (ciclo_lectivo) whereClause.ciclo_lectivo = ciclo_lectivo;

        const actividades = await Actividad.findAll({ where: whereClause });
        console.log(`Found ${actividades.length} actividades`);
        res.json(actividades);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- RUTAS DE ENTREGAS ---
// Subir entrega (Alumno)
app.post('/entregas', verifyToken, authorize(['alumno']), async (req, res) => {
    try {
        const userEmail = req.user.email;
        const alumno = await Alumno.findOne({ where: { email: userEmail } });

        if (!alumno) return res.status(404).json({ message: 'Alumno no encontrado para este usuario' });

        const { ActividadId, archivo_url, comentario } = req.body;

        // Check if already submitted? Maybe allow multiple for now

        const entrega = await Entrega.create({
            AlumnoId: alumno.id,
            ActividadId,
            archivo_url,
            comentario
        });
        res.status(201).json(entrega);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Ver entregas (Profesor: todas de una actividad / Alumno: las suyas)
app.get('/entregas', verifyToken, async (req, res) => {
    try {
        const { ActividadId } = req.query;
        let whereClause = {};

        if (ActividadId) whereClause.ActividadId = ActividadId;

        if (req.user.role === 'alumno') {
            const alumno = await Alumno.findOne({ where: { email: req.user.email } });
            if (!alumno) return res.json([]);
            whereClause.AlumnoId = alumno.id;
        } else if (['profesor', 'admin'].includes(req.user.role)) {
            // Can see all for the activity, or filter
        } else {
            return res.status(403).json({ message: 'No autorizado' });
        }

        const entregas = await Entrega.findAll({
            where: whereClause,
            include: [
                { model: Alumno, attributes: ['nombre', 'apellido'] },
                { model: Actividad, attributes: ['titulo'] }
            ]
        });
        res.json(entregas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Calificar entrega (Profesor)
app.put('/entregas/:id', verifyToken, authorize(['admin', 'profesor']), async (req, res) => {
    try {
        const { calificacion, devolucion } = req.body;
        const entrega = await Entrega.findByPk(req.params.id);

        if (!entrega) return res.status(404).json({ message: 'Entrega no encontrada' });

        // Validar si el profesor tiene asignado el curso de esta entrega?
        // Sería ideal, pero por ahora confiamos en el rol 'profesor' y que acceda via UI filtrada.
        // Opcional: Checkear Actividad -> curso -> validarAsignacionProfesor

        await entrega.update({ calificacion, devolucion });
        res.json(entrega);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});



// --- GESTIÓN DE CICLOS LECTIVOS ---

// Obtener ciclo activo
app.get('/ciclo-lectivo/actual', verifyToken, async (req, res) => {
    try {
        const actual = await CicloLectivo.findOne({ where: { activo: true } });
        res.json(actual);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Cerrar ciclo y promover (Simplificado: Pasa a todos al siguiente año numérico, mantiene división)
// Ejemplo: 1A -> 2A. 
// Requiere lógica compleja de materias aprobadas. Aquí haremos una "Promoción Manual" o "Masiva simple".
app.post('/ciclo-lectivo/promocion-masiva', verifyToken, authorize(['admin', 'director']), async (req, res) => {
    try {
        const { ciclo_origen, ciclo_destino } = req.body;
        console.log(`Iniciando promoción masiva de ${ciclo_origen} a ${ciclo_destino}`);

        const alumnos = await Alumno.findAll();
        let promovidos = 0;

        for (const alu of alumnos) {
            // Guardar historial del año que termina
            await HistorialAcademico.create({
                AlumnoId: alu.id,
                ciclo_lectivo: ciclo_origen,
                curso: alu.curso,
                condicion: 'regular', // Lógica de aprobación pendiente
                observaciones: 'Promoción automática'
            });

            // Lógica simple de cambio de curso: 1A -> 2A
            const match = alu.curso.match(/(\d+)(.*)/);
            if (match) {
                const anioCurso = parseInt(match[1]);
                const division = match[2];
                if (anioCurso < 7) { // Suponiendo 7mo año es el último
                    const nuevoCurso = `${anioCurso + 1}${division}`;
                    await alu.update({ curso: nuevoCurso });
                    promovidos++;
                } else {
                    // Egresado
                    await HistorialAcademico.update({ condicion: 'egresado' }, { where: { AlumnoId: alu.id, ciclo_lectivo: ciclo_origen } });
                }
            }
        }

        // Actualizar estados de CicloLectivo
        await CicloLectivo.update({ activo: false }, { where: { anio: ciclo_origen } });
        await CicloLectivo.findOrCreate({
            where: { anio: ciclo_destino },
            defaults: { activo: true, fecha_inicio: `${ciclo_destino}-03-01`, fecha_fin: `${ciclo_destino}-12-15` }
        });
        await CicloLectivo.update({ activo: true }, { where: { anio: ciclo_destino } });

        res.json({ message: 'Promoción masiva completada', promovidos });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});


// --- COMUNICADOS Y LLAMADOS DE ATENCIÓN ---
app.post('/comunicados', verifyToken, authorize(['admin', 'jefe_preceptores', 'director']), async (req, res) => {
    try {
        const { titulo, mensaje, tipo, destinatario_curso, AlumnoId } = req.body;

        const comunicado = await Comunicado.create({
            titulo,
            mensaje,
            tipo,
            destinatario_curso: tipo === 'general' ? destinatario_curso : null,
            AlumnoId: (tipo === 'individual' || tipo === 'llamado_atencion') ? AlumnoId : null,
            EmisorId: req.user.id
        });
        res.status(201).json(comunicado);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/comunicados', verifyToken, async (req, res) => {
    try {
        const userRole = req.user.role;
        const userEmail = req.user.email;
        let whereClause = {};
        const { Op } = require('sequelize');

        // If student/parent: see General for their course OR Individual for them
        if (['alumno', 'padre'].includes(userRole)) {
            const alumno = await Alumno.findOne({ where: { email: userEmail } }); // Simplified linkage
            if (!alumno) return res.json([]);

            whereClause = {
                [Op.or]: [
                    { tipo: 'general', destinatario_curso: alumno.curso },
                    { tipo: ['individual', 'llamado_atencion'], AlumnoId: alumno.id }
                ]
            };
        }
        // If Staff: see all sent by them? Or all in system?
        else if (['admin', 'director', 'jefe_preceptores', 'preceptor'].includes(userRole)) {
            const { curso, AlumnoId, tipo } = req.query;
            if (curso) whereClause.destinatario_curso = curso;
            if (AlumnoId) whereClause.AlumnoId = AlumnoId;
            if (tipo) whereClause.tipo = tipo;
        }

        const comunicados = await Comunicado.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            include: [
                { model: User, as: 'Emisor', attributes: ['email', 'role'] },
                { model: Alumno, as: 'DestinatarioAlumno', attributes: ['nombre', 'apellido', 'curso'] }
            ]
        });
        res.json(comunicados);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- LIBRO DE TEMAS ---
app.post('/libro-temas', verifyToken, authorize(['admin', 'profesor', 'director']), async (req, res) => {
    try {
        const { fecha, curso, materia, tema, actividad, observacion } = req.body;
        const nuevo = await LibroTema.create({
            fecha,
            curso,
            materia,
            tema,
            actividad,
            observacion,
            ProfesorId: req.user.id
        });
        res.status(201).json(nuevo);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/libro-temas', verifyToken, async (req, res) => {
    try {
        const { curso, materia } = req.query;
        let whereClause = {};
        if (curso) whereClause.curso = curso;
        if (materia) whereClause.materia = materia;

        const libros = await LibroTema.findAll({
            where: whereClause,
            order: [['fecha', 'DESC']],
            include: [
                { model: User, as: 'Profesor', attributes: ['email'] }
            ]
        });
        res.json(libros);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Servidor en puerto ${PORT} - Build: ${new Date().toISOString()} - NO PRESENTE FIELD`);
});