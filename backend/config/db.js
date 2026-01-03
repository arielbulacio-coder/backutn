const { Sequelize } = require('sequelize');
require('dotenv').config();

// Usamos la variable DATABASE_URL que configuramos arriba
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false // Esto permite que Render se conecte a Neon de forma segura
        }
    },
    logging: false, // Opcional: para que no ensucie la consola con SQL
});

module.exports = sequelize;
