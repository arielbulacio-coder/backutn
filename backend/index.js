const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const Alumno = require('./models/Alumno');
const Nota = require('./models/Nota');

const app = express();
app.use(cors());
app.use(express.json());

// Establecer Relaciones
Alumno.hasMany(Nota);
Nota.belongsTo(Alumno);

// Sincronizar Base de Datos
// { force: false } evita que se borren los datos cada vez que reinicias
sequelize.sync({ force: false }).then(() => {
    console.log('Tablas sincronizadas en la base de datos');
}).catch(err => console.log('Error al sincronizar:', err));

// Ruta para crear un alumno
app.post('/alumnos', async (req, res) => {
    try {
        const nuevoAlumno = await Alumno.create(req.body);
        res.status(201).json(nuevoAlumno);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Ruta para listar alumnos
app.get('/alumnos', async (req, res) => {
    const lista = await Alumno.findAll();
    res.json(lista);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Servidor en puerto ${PORT}`);
});