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

// Establecer Relaciones
Alumno.hasMany(Nota);
Nota.belongsTo(Alumno);

const bcrypt = require('bcryptjs');

// Sincronizar Base de Datos
// { force: false } evita que se borren los datos cada vez que reinicias
sequelize.sync({ force: false }).then(async () => {
    console.log('Tablas sincronizadas en la base de datos');

    // Crear usuario admin por defecto si no existe ninguno
    try {
        const adminExists = await User.findOne({ where: { email: 'admin@admin.com' } });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.create({
                email: 'admin@admin.com',
                password: hashedPassword,
                role: 'admin'
            });
            console.log('Usuario admin creado por defecto: admin@admin.com / admin123');
        }
    } catch (error) {
        console.error('Error al crear usuario admin:', error);
    }
}).catch(err => console.log('Error al sincronizar:', err));

// Rutas de Autenticación
app.use('/', authRoutes);

// Ruta para crear un alumno (Protegida)
app.post('/alumnos', verifyToken, async (req, res) => {
    try {
        const nuevoAlumno = await Alumno.create(req.body);
        res.status(201).json(nuevoAlumno);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Ruta para listar alumnos (Protegida)
app.get('/alumnos', verifyToken, async (req, res) => {
    const lista = await Alumno.findAll();
    res.json(lista);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Servidor en puerto ${PORT}`);
});