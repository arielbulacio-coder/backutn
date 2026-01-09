const sequelize = require('./config/db');
const Alumno = require('./models/Alumno');
const Nota = require('./models/Nota');

Alumno.hasMany(Nota);
Nota.belongsTo(Alumno);

async function debug() {
    try {
        console.log('--- Buscando Juan Perez ---');
        const juan = await Alumno.findOne({ where: { legajo: 'L001' }, include: [Nota] });
        if (!juan) {
            console.log('Juan Perez no encontrado');
        } else {
            console.log('ID:', juan.id);
            console.log('Email Padre:', juan.email_padre);
            console.log('Cant Notas:', juan.Notas ? juan.Notas.length : 'null/undefined');
            if (juan.Notas) {
                juan.Notas.forEach(n => console.log(` - ${n.materia}: ${n.t1_p1}`));
            }
            console.log('JSON Raw keys:', Object.keys(juan.toJSON()));
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
