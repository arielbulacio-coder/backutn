require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./config/db');

// Define models minimally for query
const User = sequelize.define('User', {
    email: { type: DataTypes.STRING, unique: true },
    role: { type: DataTypes.ENUM('admin', 'alumno', 'profesor') }
});

const ProfesorMateria = sequelize.define('ProfesorMateria', {
    email_profesor: { type: DataTypes.STRING },
    curso: { type: DataTypes.STRING },
    materia: { type: DataTypes.STRING },
    ciclo_lectivo: { type: DataTypes.INTEGER }
});

async function check() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected');

        // Check User
        const users = await User.findAll({ where: { role: 'profesor' } });
        console.log('--- Profesores found ---');
        users.forEach(u => console.log(`${u.id}: ${u.email}`));

        // Check Assignments for 'profesor1@utn.com'
        const email = 'profesor1@utn.com';
        const assigns = await ProfesorMateria.findAll({ where: { email_profesor: email } });

        console.log(`\n--- Assignments for ${email} ---`);
        if (assigns.length === 0) console.log('NO ASSIGNMENTS FOUND');
        assigns.forEach(a => console.log(`${a.curso} - ${a.materia} (${a.ciclo_lectivo})`));

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
