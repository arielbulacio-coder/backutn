const sequelize = require('./config/db');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function createProfiles() {
    try {
        await sequelize.authenticate();
        console.log('Conexión establecida.');

        const profiles = [
            { email: 'profesor1@utn.com', role: 'profesor', pass: 'profesor123' },
            { email: 'director@utn.com', role: 'director', pass: 'director123' },
            { email: 'preceptor1@utn.com', role: 'preceptor', pass: 'preceptor123' }
        ];

        for (const p of profiles) {
            const hashedPassword = await bcrypt.hash(p.pass, 10);
            const [user, created] = await User.findOrCreate({
                where: { email: p.email },
                defaults: {
                    password: hashedPassword,
                    role: p.role
                }
            });

            if (created) {
                console.log(`✅ Usuario creado: ${p.email} (${p.role}) - Pass: ${p.pass}`);
            } else {
                user.role = p.role; // Aseguramos el rol
                user.password = hashedPassword;
                await user.save();
                console.log(`🔄 Usuario actualizado/reseteado: ${p.email} (${p.role}) - Pass: ${p.pass}`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

createProfiles();
