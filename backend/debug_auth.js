const sequelize = require('./config/db');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function checkAuth(email, password) {
    try {
        await sequelize.authenticate();
        console.log(`🔍 Verificando usuario: ${email}`);

        const user = await User.findOne({ where: { email } });

        if (!user) {
            console.log('❌ Usuario NO encontrado en la base de datos.');
            return;
        }

        console.log(`✅ Usuario encontrado. Rol: ${user.role}`);
        console.log(`🔑 Hash almacenado: ${user.password}`);

        const match = await bcrypt.compare(password, user.password);

        if (match) {
            console.log('✅✅ CONTRASEÑA CORRECTA. El login debería funcionar.');
        } else {
            console.log('❌ CONTRASEÑA INCORRECTA. El hash no coincide.');
            console.log('Probando regenerar hash para este password...');
            const newHash = await bcrypt.hash(password, 10);
            console.log(`Nuevo Hash simulado: ${newHash}`);

            // Opcional: Reparar automáticamente
            user.password = newHash;
            await user.save();
            console.log('🛠️ Contraseña REPARADA en la base de datos. Intente loguearse ahora.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

// Cambiar estos valores para probar el usuario que falla
const emailPrueba = 'arielbulacio@gmail.com';
const passPrueba = 'ariel2027';

checkAuth(emailPrueba, passPrueba);
