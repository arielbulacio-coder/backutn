const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Built-in node module for random bytes
const nodemailer = require('nodemailer');

// Configuración de transporte de correo (simulado o real)
// En producción, usar variables de env reales: SMTP_HOST, SMTP_USER, etc.
const transporter = nodemailer.createTransport({
    // Configuración específica de Gmail (o usar host smtp.gmail.com)
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 465,
    secure: true, // true para 465, false para otros puertos
    auth: {
        user: process.env.SMTP_USER || 'arielbulacio@gmail.com',
        pass: process.env.SMTP_PASS || 'cfp402miescuela'
    }
});

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

// --- RECUPERACIÓN DE CONTRASEÑA ---

// 1. Solicitar Reseteo (Generar link)
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        // Por seguridad, no decimos si el usuario no existe, solo enviamos mensaje genérico
        // Pero para debug, retornamos algo si no existe en desarrollo
        if (!user) {
            return res.status(404).json({ message: 'No existe usuario con ese email (Seguridad: esto debería ser genérico en prod)' });
        }

        // Generar token random
        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiration = Date.now() + 3600000; // 1 hora de validez

        user.resetToken = resetToken;
        user.resetTokenExpiration = tokenExpiration;
        await user.save();

        // Enlace de recuperación (Asumiendo que el frontend corre en el origen de la petición o config)
        // En prod, usar variable de entorno FRONTEND_URL
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        // Nota: Ajustar localhost:5173 al puerto real de tu frontend si es diferente
        const resetUrl = `${frontendUrl}/#/reset-password/${resetToken}`;

        const message = `
            <h1>Recuperación de Contraseña</h1>
            <p>Has solicitado restablecer tu contraseña.</p>
            <p>Haz clic en el siguiente enlace para continuar:</p>
            <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
            <p>Este enlace expira en 1 hora.</p>
        `;

        // Intentar enviar correo
        try {
            if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
                throw new Error('No SMTP credentials found');
            }

            await transporter.sendMail({
                to: email,
                from: 'Soporte UTN <noreply@utn.com>',
                subject: 'Restablecer contraseña - Escuela Técnica',
                html: message
            });

            res.json({ message: 'Correo de recuperación enviado. Revisa tu bandeja de entrada.' });

        } catch (emailError) {
            console.log('--- MODO DEBUG: EMAIL SIMULADO ---');
            console.log(`To: ${email}`);
            console.log(`Link: ${resetUrl}`);
            console.log('----------------------------------');
            // Devolvemos éxito al usuario aunque falle el SMTP real, para no bloquear en dev
            // En prod esto debería ser handled mejor.
            res.json({
                message: 'Correo enviado (Simulado en consola por falta de credenciales SMTP)',
                debugLink: resetUrl // Solo para facilitar pruebas, quitar en prod estricto
            });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Restablecer Contraseña (Usar token)
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        // Buscar usuario con token válido y no expirado
        // Sequelize operator usage might require requiring Op, let's use refined search
        const { Op } = require('sequelize');

        const user = await User.findOne({
            where: {
                resetToken: token,
                resetTokenExpiration: { [Op.gt]: Date.now() } // Expiration > Now
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Token inválido o expirado' });
        }

        // Actualizar password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Limpiar token
        user.resetToken = null;
        user.resetTokenExpiration = null;
        await user.save();

        res.json({ message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
