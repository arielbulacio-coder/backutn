const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register (Public or Protected depending on strategy, assuming Public for now but only for 'alumno' by default)
router.post('/register', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Verificar si existe
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ message: 'El usuario ya existe' });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Crear usuario
        // Nota: En un sistema real, no permitirías enviar 'role' libremente desde el registro público.
        // Aquí lo permitimos para facilitar la carga inicial o debieras usar el panel administrativo.
        const user = await User.create({
            email,
            password: hashedPassword,
            role: role || 'alumno'
        });

        res.status(201).json({ message: 'Usuario creado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ message: 'Usuario o contraseña incorrectos' });

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return res.status(400).json({ message: 'Usuario o contraseña incorrectos' });

        // Crear token
        const token = jwt.sign(
            { id: user.id, role: user.role, email: user.email },
            process.env.JWT_SECRET || 'secreto_super_seguro',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
