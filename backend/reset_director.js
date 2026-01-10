const sequelize = require('./config/db');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function reset() {
    try {
        await sequelize.authenticate();
        const email = 'director@utn.com';
        const pass = 'director';
        const hash = await bcrypt.hash(pass, 10);

        let user = await User.findOne({ where: { email } });
        if (user) {
            user.password = hash;
            user.role = 'director'; // Ensure role is correct too
            await user.save();
            console.log('Director password updated.');
        } else {
            await User.create({ email, password: hash, role: 'director' });
            console.log('Director created.');
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
reset();
