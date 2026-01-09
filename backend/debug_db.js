const sequelize = require('./config/db');
const Alumno = require('./models/Alumno');
const Nota = require('./models/Nota');

Alumno.hasMany(Nota, { as: 'Notas' });
Nota.belongsTo(Alumno);

async function debug() {
    try {
        console.log('--- Buscando Juan Perez ---');
        const juan = await Alumno.findOne({
            where: { legajo: 'L001' },
            include: [{ model: Nota, as: 'Notas' }]
        });
        if (!juan) {
            console.log('Juan Perez no encontrado');
        } else {
            console.log('ID:', juan.id);
            console.log('Email Padre:', juan.email_padre);
            const notas = juan.Notas || [];
            console.log('Cant Notas:', notas.length);
            notas.forEach(n => console.log(` - Materia: [${n.materia}] Nota T1P1: ${n.t1_p1}`));
        }

        console.log('\n--- Buscando Padre1 ---');
        const padre = await Alumno.findOne({ where: { email_padre: 'padre1@utn.com' } });
        console.log('Padre1 tiene alumno?', padre ? padre.nombre : 'NO');

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

debug();
