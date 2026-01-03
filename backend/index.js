const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors()); // Permite peticiones externas
app.use(express.json()); // Permite leer JSON en el body

app.get('/', (req, res) => {
    res.send('API de Gestión Académica funcionando 🚀');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});