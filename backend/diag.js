const Material = require('./models/Material');
const Actividad = require('./models/Actividad');
const Alumno = require('./models/Alumno');

async function check() {
    try {
        const mCount = await Material.count();
        const aCount = await Actividad.count();
        console.log(`MATERIALES TOTAL: ${mCount}`);
        console.log(`ACTIVIDADES TOTAL: ${aCount}`);

        const juan = await Alumno.findOne({ where: { legajo: 'L001' } });
        if (juan) {
            console.log(`Juan Curso: ${juan.curso}`);
            const mJuan = await Material.findAll({ where: { curso: juan.curso } });
            console.log(`Materiales para curso ${juan.curso}: ${mJuan.length}`);
            if (mJuan.length > 0) {
                console.log('Muestras Materias Materiales:', [...new Set(mJuan.map(x => x.materia))]);
            }

            const aJuan = await Actividad.findAll({ where: { curso: juan.curso } });
            console.log(`Actividades para curso ${juan.curso}: ${aJuan.length}`);
            if (aJuan.length > 0) {
                console.log('Muestras Materias Actividades:', [...new Set(aJuan.map(x => x.materia))]);
            }
        }
    } catch (e) {
        console.error('ERROR EN DIAG:', e);
    } finally {
        process.exit();
    }
}
check();
