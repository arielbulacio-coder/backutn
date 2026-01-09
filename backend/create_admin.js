const sequelize = require('./config/db');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function createAdmin() {
    try {
        await sequelize.authenticate();
        console.log('Conexión establecida con éxito.');

        // Sincronizar modelos
        await sequelize.sync();

        const email = 'arielbulacio@gmail.com';
        const password = 'ariel2027';
        const hashedPassword = await bcrypt.hash(password, 10);

        const [user, created] = await User.findOrCreate({
            where: { email },
            defaults: {
                password: hashedPassword,
                role: 'admin'
            }
        });

        if (created) {
            console.log('Usuario creado exitosamente.');
        } else {
            console.log('El usuario ya existía. Actualizando contraseña...');
            user.password = hashedPassword;
            user.role = 'admin';
            await user.save();
            console.log('Contraseña actualizada.');
        }

        console.log(`Credenciales: ${email} / ${password}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

createAdmin();
