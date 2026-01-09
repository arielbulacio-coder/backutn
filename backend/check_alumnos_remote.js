
async function checkAlumnos() {
    try {
        console.log('Login Director...');
        const loginResponse = await fetch('https://backutn.onrender.com/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'director@utn.com', password: '123456' })
        });

        if (!loginResponse.ok) throw new Error('Login failed: ' + await loginResponse.text());
        const { token } = await loginResponse.json();
        console.log('Token OK.');

        console.log('Fetching Alumnos...');
        const alumnosResponse = await fetch('https://backutn.onrender.com/alumnos', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!alumnosResponse.ok) {
            console.error('Alumnos Error Status:', alumnosResponse.status);
            console.error('Alumnos Error Text:', await alumnosResponse.text());
            return;
        }

        const alumnos = await alumnosResponse.json();
        console.log(`Recibidos ${alumnos.length} alumnos.`);
        if (alumnos.length > 0) {
            console.log('Ejemplo Alumno 0:', JSON.stringify(alumnos[0], null, 2));
        }

    } catch (e) {
        console.error('Error:', e);
    }
}
checkAlumnos();
