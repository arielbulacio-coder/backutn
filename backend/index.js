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

const Asistencia = require('./models/Asistencia');
const Material = require('./models/Material');
const Actividad = require('./models/Actividad');
const Entrega = require('./models/Entrega');
const CicloLectivo = require('./models/CicloLectivo');
const HistorialAcademico = require('./models/HistorialAcademico');
const ProfesorMateria = require('./models/ProfesorMateria');
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
    } catch (error) {
        console.error('Error al crear usuario admin:', error);
    }
}).catch(err => console.log('Error al sincronizar:', err));

// Rutas de Autenticación
app.use('/', authRoutes);

// --- GESTIÓN DE USUARIOS (ADMIN) ---
app.get('/users', verifyToken, authorize(['admin']), async (req, res) => {
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
        console.log('Seeding general data...');
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
                t1_p1: (Math.random() * 3 + 7).toFixed(2),
                t1_p2: (Math.random() * 3 + 7).toFixed(2),
                t2_p1: (Math.random() * 4 + 6).toFixed(2)
            }));
            await Nota.bulkCreate(notas);
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
                    curso: curso, materia: mat, tipo: 'video',
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
        const lista = await Alumno.findAll({
            include: [
                { model: Nota, as: 'Notas' },
                { model: Asistencia, as: 'Asistencias' },
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
app.get('/profesor/asignaciones', verifyToken, authorize(['profesor', 'admin']), async (req, res) => {
    try {
        if (req.user.role === 'admin') {
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
app.post('/admin/asignar-materia', verifyToken, authorize(['admin', 'director', 'secretario']), async (req, res) => {
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

// --- RUTAS DE NOTAS ---
// Cargar nota: Profesor (validado), Admin
app.post('/notas', verifyToken, authorize(['admin', 'profesor', 'director']), async (req, res) => {
    try {
        const { AlumnoId, materia, ...grades } = req.body;

        if (!AlumnoId || !materia) {
            return res.status(400).json({ message: 'Faltan datos requeridos (AlumnoId, materia)' });
        }

        const alumno = await Alumno.findByPk(AlumnoId);
        if (!alumno) return res.status(404).json({ message: 'Alumno no encontrado' });

        // VALIDAR PERMISO PROFESOR
        const permitido = await validarAsignacionProfesor(req.user, alumno.curso, materia);
        if (!permitido) {
            return res.status(403).json({ message: 'No tiene asignada esta materia en este curso.' });
        }

        // Buscar registro único por alumno y materia
        let notaRecord = await Nota.findOne({
            where: { AlumnoId, materia } // Deberia filtrar por ciclo tb, asumimos current handling
        });

        if (notaRecord) {
            // Actualizar campos recibidos
            await notaRecord.update(grades);
            return res.status(200).json(notaRecord);
        } else {
            // Crear nuevo
            notaRecord = await Nota.create({ AlumnoId, materia, ...grades });
            return res.status(201).json(notaRecord);
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// --- RUTAS DE ASISTENCIA ---
// Tomar lista: Preceptor, Jefe, Director, Admin
app.post('/asistencias', verifyToken, authorize(['admin', 'preceptor', 'jefe_preceptores', 'director']), async (req, res) => {
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

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Servidor en puerto ${PORT} - Build: ${new Date().toISOString()} - NO PRESENTE FIELD`);
});