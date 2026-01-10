const API_URL = 'http://localhost:10000'; // Ajustar si es necesario
let token = '';

const login = async () => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'arielbulacio@gmail.com',
                password: 'ariel2027'
            })
        });

        if (!response.ok) throw new Error(`Status: ${response.status}`);

        const data = await response.json();
        token = data.token;
        console.log('✅ Login exitoso');
    } catch (error) {
        console.error('❌ Error en login:', error.message);
        process.exit(1);
    }
};

const createLibroTema = async () => {
    try {
        const data = {
            fecha: new Date().toISOString().split('T')[0],
            curso: '5B',
            materia: 'Matemática',
            tema: 'Derivadas - Test Fetch',
            actividad: 'Ejercicios 1 a 10 con Fetch',
            observacion: 'Clase normal validada'
        };

        const response = await fetch(`${API_URL}/libro-temas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Status: ${response.status} - ${err}`);
        }

        const result = await response.json();
        console.log('✅ POST /libro-temas exitoso:', result.tema);
        return result;
    } catch (error) {
        console.error('❌ Error POST /libro-temas:', error.message);
    }
};

const getLibroTemas = async () => {
    try {
        const params = new URLSearchParams({
            curso: '5B',
            materia: 'Matemática'
        });

        const response = await fetch(`${API_URL}/libro-temas?${params}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error(`Status: ${response.status}`);

        const data = await response.json();

        console.log(`✅ GET /libro-temas exitoso. Registros encontrados: ${data.length}`);

        const found = data.some(item => item.tema === 'Derivadas - Test Fetch');
        if (found) {
            console.log('✅ Verificación completada: El tema creado aparece en la lista.');
        } else {
            console.error('❌ Error verifación: El tema creado NO aparece en la lista.');
        }

    } catch (error) {
        console.error('❌ Error GET /libro-temas:', error.message);
    }
};

const runTests = async () => {
    console.log('--- Iniciando Pruebas de Libro de Temas (Fetch) ---');
    await login();
    await createLibroTema();
    await getLibroTemas();
    console.log('--- Fin de Pruebas ---');
};

runTests();
