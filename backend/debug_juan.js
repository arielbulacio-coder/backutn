const sequelize = require('./config/db');
const User = require('./models/User');
const Alumno = require('./models/Alumno');
const Nota = require('./models/Nota');
const HistorialAcademico = require('./models/HistorialAcademico');

async function debugJuan() {
    try {
        await sequelize.authenticate();
        console.log('--- DIAGNÓSTICO JUAN PÉREZ ---');
        console.log('DB Host:', sequelize.config.host);
        console.log('DB Database:', sequelize.config.database);

        const email = 'juan.perez@alumno.utn.edu.ar';

        // 1. Verificar Usuario
        const user = await User.findOne({ where: { email } });
        console.log('\n1. Usuario (Login):');
        if (user) {
            console.log(`   ID: ${user.id}, Role: ${user.role}, Email: ${user.email}`);
        } else {
            console.error('   ❌ NO ENCONTRADO EN TABLA USERS');
        }

        // 2. Verificar Alumno
        const alumno = await Alumno.findOne({
            where: { email },
            include: ['Notas', 'Historial']
        });

        console.log('\n2. Alumno (Datos Académicos):');
        if (alumno) {
            console.log(`   ID: ${alumno.id}, Legajo: ${alumno.legajo}, Curso: ${alumno.curso}`);
            console.log(`   Email registrado: '${alumno.email}'`);

            // 3. Notas
            const notas = alumno.Notas || [];
            console.log(`\n3. Notas asociadas: ${notas.length}`);
            notas.forEach(n => console.log(`   - ${n.materia}: Final ${n.final_cursada ?? '-'}, T1_P1: ${n.t1_p1 ?? '-'}`));

            // 4. Historial
            const historial = alumno.Historial || [];
            console.log(`\n4. Historial asociado: ${historial.length}`);
            historial.forEach(h => console.log(`   - Año: ${h.ciclo_lectivo}, Curso: ${h.curso}, Condición: ${h.condicion}`));

        } else {
            console.error('   ❌ NO ENCONTRADO EN TABLA ALUMNOS CON ESE EMAIL');
            const porLegajo = await Alumno.findOne({ where: { legajo: '12345' } });
            if (porLegajo) {
                console.log(`   ⚠️ PERO SI EXISTE POR LEGAJO 12345. Email en esa ficha: '${porLegajo.email}'`);
            }
        }

    } catch (error) {
        console.error('Error Fatal:', error);
    } finally {
        process.exit();
    }
}

debugJuan();
