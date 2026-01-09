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
const authorize = require('./middleware/roleMiddleware');

// Establecer Relaciones
Alumno.hasMany(Nota, { as: 'Notas' });
Nota.belongsTo(Alumno);

Alumno.hasMany(Asistencia, { as: 'Asistencias' });
Asistencia.belongsTo(Alumno);

const bcrypt = require('bcryptjs');

// Sincronizar Base de Datos
// { force: false } evita que se borren los datos cada vez que reinicias
sequelize.sync({ alter: true }).then(async () => {
    console.log('Tablas sincronizadas en la base de datos');

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
app.post('/test/seed', verifyToken, authorize(['admin']), async (req, res) => {
    try {
        const passwordHash = await bcrypt.hash('123456', 10);

        // 1. Usuarios
        const usersData = [
            { email: 'profesor@utn.com', role: 'profesor' },
            { email: 'preceptor@utn.com', role: 'preceptor' },
            { email: 'director@utn.com', role: 'director' },
            { email: 'alumno1@utn.com', role: 'alumno' },
            { email: 'padre1@utn.com', role: 'padre' },
        ];

        for (const u of usersData) {
            await User.findOrCreate({
                where: { email: u.email },
                defaults: { password: passwordHash, role: u.role }
            });
        }

        // 2. Alumnos
        const alumnosData = [
            { nombre: 'Juan', apellido: 'Perez', email: 'alumno1@utn.com', legajo: 'L001', curso: '1A', email_padre: 'padre1@utn.com' },
            { nombre: 'Maria', apellido: 'Lopez', email: 'maria@utn.com', legajo: 'L002', curso: '1A', email_padre: 'padre2@utn.com' },
            { nombre: 'Carlos', apellido: 'Gomez', email: 'carlos@utn.com', legajo: 'L003', curso: '2B' },
        ];

        for (const a of alumnosData) {
            const [alumno, created] = await Alumno.findOrCreate({
                where: { legajo: a.legajo },
                defaults: a
            });
            if (!created) {
                await alumno.update(a);
            }
        }

        // 3. Notas de prueba (Para Juan Perez en TODAS las materias)
        const juan = await Alumno.findOne({ where: { legajo: 'L001' } });
        if (juan) {
            const materias = ['Matemática', 'Lengua', 'Física', 'Historia', 'Geografía', 'Inglés', 'Educación Física', 'Biología', 'Taller General'];

            // Limpiar notas previas para asegurar que el seed sea determinista
            await Nota.destroy({ where: { AlumnoId: juan.id } });

            for (const mat of materias) {
                const rand = (min, max) => (Math.random() * (max - min) + min).toFixed(2);
                await Nota.create({
                    t1_p1: rand(7, 10), t1_p2: rand(7, 10), t1_p3: rand(7, 10),
                    t2_p1: rand(6, 9), t2_p2: rand(6, 9), t2_p3: rand(7, 10),
                    t3_p1: rand(8, 10), t3_p2: rand(8, 10), t3_p3: rand(8, 10),
                    final_anual: rand(7, 10),
                    AlumnoId: juan.id, materia: mat,
                    final_cursada: rand(7, 10)
                });
            }
        }

        // 4. Materiales y Actividades de prueba (LMS)
        await Material.destroy({ where: { curso: '1A' } });
        await Actividad.destroy({ where: { curso: '1A' } });

        await Material.create({
            titulo: 'Introducción a la Electrónica',
            descripcion: 'Conceptos básicos, ley de ohm y potencia.',
            curso: '1A', materia: 'Matemática', tipo: 'pdf',
            url: 'https://example.com/intro.pdf'
        });

        await Material.create({
            titulo: 'Video: Circuitos en Serie',
            descripcion: 'Explicación detallada con ejemplos prácticos.',
            curso: '1A', materia: 'Matemática', tipo: 'youtube',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        });

        await Actividad.create({
            titulo: 'TP N°1: Cálculo de Resistencias',
            descripcion: 'Resolver los ejercicios planteados en el material de lectura.',
            curso: '1A', materia: 'Matemática',
            fecha_entrega: '2026-03-20'
        });

        res.json({
            message: 'Datos de prueba (alumnos, notas, LMS) creados correctamente',
            notas_cargadas: juan ? materias.length : 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
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
        const lista = await Alumno.findAll({ include: [{ model: Nota, as: 'Notas' }, { model: Asistencia, as: 'Asistencias' }] });
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
                include: [{ model: Nota, as: 'Notas' }, { model: Asistencia, as: 'Asistencias' }]
            });
        } else if (req.user.role === 'padre') {
            alumno = await Alumno.findOne({
                where: { email_padre: userEmail },
                include: [{ model: Nota, as: 'Notas' }, { model: Asistencia, as: 'Asistencias' }]
            });
        } else {
            // Admin can see any? For now just as safeguard
            alumno = await Alumno.findOne({ include: [{ model: Nota, as: 'Notas' }, { model: Asistencia, as: 'Asistencias' }] });
        }

        if (!alumno) {
            return res.status(404).json({ message: 'No se encontró información del alumno asociado.' });
        }

        res.json(alumno);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- RUTAS DE NOTAS ---
// Cargar nota: Profesor, Admin
app.post('/notas', verifyToken, authorize(['admin', 'profesor', 'director']), async (req, res) => {
    try {
        const { AlumnoId, materia, ...grades } = req.body;

        if (!AlumnoId || !materia) {
            return res.status(400).json({ message: 'Faltan datos requeridos (AlumnoId, materia)' });
        }

        const alumno = await Alumno.findByPk(AlumnoId);
        if (!alumno) return res.status(404).json({ message: 'Alumno no encontrado' });

        // Buscar registro único por alumno y materia
        let notaRecord = await Nota.findOne({
            where: { AlumnoId, materia }
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

const Material = require('./models/Material');
const Actividad = require('./models/Actividad');

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
        const material = await Material.create(req.body);
        res.status(201).json(material);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/materiales', verifyToken, async (req, res) => {
    try {
        // Filtros opcionales por query string: ?curso=1A&materia=Matemática
        const whereClause = {};
        if (req.query.curso) whereClause.curso = req.query.curso;
        if (req.query.materia) whereClause.materia = req.query.materia;

        const materiales = await Material.findAll({ where: whereClause });
        res.json(materiales);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actividades
app.post('/actividades', verifyToken, authorize(['admin', 'profesor']), async (req, res) => {
    try {
        const actividad = await Actividad.create(req.body);
        res.status(201).json(actividad);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/actividades', verifyToken, async (req, res) => {
    try {
        const whereClause = {};
        if (req.query.curso) whereClause.curso = req.query.curso;
        if (req.query.materia) whereClause.materia = req.query.materia;

        const actividades = await Actividad.findAll({ where: whereClause });
        res.json(actividades);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Servidor en puerto ${PORT}`);
});