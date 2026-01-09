

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

        const cycles = [2025];

        for (const cycle of cycles) {
            console.log(`\n--- Fetching Alumnos for Cycle ${cycle} ---`);
            const response = await fetch(`https://backutn.onrender.com/alumnos?ciclo_lectivo=${cycle}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                console.error(`Error Status ${cycle}:`, response.status);
                console.error('Error Text:', await response.text());
                continue;
            }

            const alumnos = await response.json();
            console.log(`Recibidos ${alumnos.length} alumnos para ${cycle}.`);

            // Find Juan Perez or first one
            const juan = alumnos.find(a => a.legajo === 'L001') || alumnos[0];
            if (juan) {
                console.log(`Alumno: ${juan.nombre} ${juan.apellido}`);
                const notas = juan.Notas || [];
                console.log(`Notas encontradas (${notas.length}):`);
                if (notas.length > 0) {
                    // Show first note as sample
                    const nota = notas[0];
                    console.log(` - Materia: ${nota.materia}, Ciclo: ${nota.ciclo_lectivo}, T1: ${nota.t1_p1}`);
                } else {
                    console.log(' - Sin notas para este ciclo.');
                }
            }
        }

    } catch (e) {
        console.error('Error:', e);
    }
}
checkAlumnos();
