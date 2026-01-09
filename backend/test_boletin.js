const Alumno = require('./models/Alumno');
const Nota = require('./models/Nota');
const Asistencia = require('./models/Asistencia');
const User = require('./models/User');

Alumno.hasMany(Nota, { as: 'Notas' });
Nota.belongsTo(Alumno);
Alumno.hasMany(Asistencia, { as: 'Asistencias' });
Asistencia.belongsTo(Alumno);

async function test(email) {
    console.log(`--- Test Boletin para: ${email} ---`);
    const alumno = await Alumno.findOne({
        where: { email_padre: email },
        include: [
            { model: Nota, as: 'Notas' },
            { model: Asistencia, as: 'Asistencias' }
        ]
    });

    if (alumno) {
        console.log(`Alumno: ${alumno.nombre} ${alumno.apellido}`);
        console.log(`Cant Notas: ${alumno.Notas ? alumno.Notas.length : 'null'}`);
        if (alumno.Notas) {
            alumno.Notas.forEach(n => console.log(` - ${n.materia} (ID:${n.id})`));
        }
    } else {
        console.log('Alumno no encontrado por email_padre');
    }
}

test('padre1@utn.com').then(() => process.exit());
