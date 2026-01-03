const { Sequelize } = require('sequelize');
require('dotenv').config();

// Render te dará una "Internal Database URL" o una "External Database URL"
// Asegúrate de pegarla en tu archivo .env como DATABASE_URL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false, // Para que no llene la consola de logs de SQL
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false // Necesario para conexiones seguras en Render/Supabase
        }
    }
});

module.exports = sequelize;
