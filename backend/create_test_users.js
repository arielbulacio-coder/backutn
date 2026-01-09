const sequelize = require('./config/db');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function createTestUsers() {
    try {
        await sequelize.authenticate();
        console.log('Conexión DB establecida.');

        const passwordHash = await bcrypt.hash('123456', 10);

        // 1. Usuario Alumno
        const [userAlumno, createdA] = await User.findOrCreate({
            where: { email: 'juan.perez@alumno.utn.edu.ar' },
            defaults: {
                password: passwordHash,
                role: 'alumno'
            }
        });

        if (!createdA) {
            // Asegurar contraseña conocida si ya existía
            userAlumno.password = passwordHash;
            userAlumno.role = 'alumno';
            await userAlumno.save();
            console.log('Usuario Alumno actualizado.');
        } else {
            console.log('Usuario Alumno creado.');
        }

        // 2. Usuario Padre
        const [userPadre, createdP] = await User.findOrCreate({
            where: { email: 'padre.perez@gmail.com' },
            defaults: {
                password: passwordHash,
                role: 'padre'
            }
        });

        if (!createdP) {
            userPadre.password = passwordHash;
            userPadre.role = 'padre';
            await userPadre.save();
            console.log('Usuario Padre actualizado.');
        } else {
            console.log('Usuario Padre creado.');
        }

        console.log('Credenciales listas.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

createTestUsers();
