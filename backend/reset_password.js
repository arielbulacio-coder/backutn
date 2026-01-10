const sequelize = require('./config/db');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function resetPass() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected');

        const email = 'profesor1@utn.com';
        const newPass = 'profesor1';

        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.log('User not found, creating...');
            const hashedPassword = await bcrypt.hash(newPass, 10);
            await User.create({ email, password: hashedPassword, role: 'profesor' });
        } else {
            console.log('User found, updating password...');
            const hashedPassword = await bcrypt.hash(newPass, 10);
            user.password = hashedPassword;
            await user.save();
        }

        console.log(`Password for ${email} reset to '${newPass}'`);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
resetPass();
