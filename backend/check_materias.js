const Nota = require('./models/Nota');
async function f() {
    const notas = await Nota.findAll({ attributes: ['materia'], limit: 50 });
    const unique = [...new Set(notas.map(n => n.materia))];
    console.log('Materias en DB:', JSON.stringify(unique));
}
f().then(() => process.exit());
