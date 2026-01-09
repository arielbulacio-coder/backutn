
async function runSeed() {
    try {
        console.log('Iniciando sesión como Admin...');
        const loginResponse = await fetch('https://backutn.onrender.com/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'arielbulacio@gmail.com',
                password: 'ariel2027'
            })
        });

        if (!loginResponse.ok) {
            throw new Error(`Login falló: ${loginResponse.statusText}`);
        }

        const loginData = await loginResponse.json();
        const token = loginData.token;
        console.log('Token obtenido. Ejecutando Seed...');

        const seedResponse = await fetch('https://backutn.onrender.com/test/seed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const seedData = await seedResponse.json();
        console.log('Resultado:', seedData);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

runSeed();
