const sequelize = require('./config/db');
const Alumno = require('./models/Alumno');
const Nota = require('./models/Nota');
const Material = require('./models/Material');
const Actividad = require('./models/Actividad');

Alumno.hasMany(Nota, { as: 'Notas' });
Nota.belongsTo(Alumno);

async function check() {
    try {
        console.log('--- INFO ALUMNO JUAN PEREZ (L001) ---');
        const juan = await Alumno.findOne({
            where: { legajo: 'L001' },
            include: [{ model: Nota, as: 'Notas' }]
        });

        if (!juan) {
            console.log('Juan no está en la DB');
        } else {
            console.log(`Nombre: ${juan.nombre} ${juan.apellido}`);
            console.log(`Email Alumno: ${juan.email}`);
            console.log(`Email Padre: ${juan.email_padre}`);
            console.log(`Curso: ${juan.curso}`);
            console.log(`Notas encontradas: ${juan.Notas ? juan.Notas.length : 0}`);
            if (juan.Notas) {
                juan.Notas.slice(0, 3).forEach(n => console.log(` - ${n.materia}: ${n.t1_p1}`));
            }
        }

        console.log('\n--- INFO LMS (CURSO 1A) ---');
        const mats = await Material.findAll({ where: { curso: '1A' } });
        console.log(`Materiales en 1A: ${mats.length}`);
        if (mats.length > 0) {
            console.log(` - Primero: ${mats[0].titulo} (${mats[0].materia})`);
        }

        const acts = await Actividad.findAll({ where: { curso: '1A' } });
        console.log(`Actividades en 1A: ${acts.length}`);

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

check();
