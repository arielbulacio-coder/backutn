const API_URL = 'http://localhost:10000';
let token = '';
let userId = null;

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
        userId = data.user.id;
        console.log('✅ Login exitoso');
    } catch (error) {
        console.error('❌ Error en login:', error.message);
        process.exit(1);
    }
};

const updateProfile = async () => {
    try {
        console.log('--- Probando Actualización de Perfil ---');
        const updateData = {
            telefono: '+54 11 1234 5678',
            bio: 'Profesor de Matemáticas y Programación.',
            intereses: 'Educación, Tecnología, IA',
            // Simple base64 pixel for test
            foto: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
        };

        const response = await fetch(`${API_URL}/perfil`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
        });

        if (!response.ok) throw new Error(`Status: ${response.status}`);

        const data = await response.json();
        const u = data.user;

        if (u.telefono === updateData.telefono && u.bio === updateData.bio) {
            console.log('✅ Perfil actualizado correctamente (Tel/Bio verificados).');
        } else {
            console.error('❌ Error: Los datos retornados no coinciden con los enviados.');
        }

    } catch (error) {
        console.error('❌ Error PUT /perfil:', error.message);
    }
};

const testPlanningLink = async () => {
    try {
        console.log('--- Probando Enlace de Planificación ---');

        // 1. Asignar materia primero (o buscar una existente)
        // Crearemos una asignación de prueba si no existe la lógica completa, 
        // pero usaremos el endpoint de asignar para asegurar.
        const assignData = {
            email_profesor: 'arielbulacio@gmail.com',
            curso: '6A',
            materia: 'Laboratorio de Hardware'
        };

        const resAssign = await fetch(`${API_URL}/admin/asignar-materia`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(assignData)
        });

        if (!resAssign.ok) throw new Error(`Asignación fallida: ${resAssign.status}`);
        const asignacion = await resAssign.json();
        console.log(`✅ Materia asignada ID: ${asignacion.id}`);

        // 2. Actualizar Planificación
        const linkUrl = 'https://docs.google.com/document/d/TEST-PLANNING-DOC';

        const resPlan = await fetch(`${API_URL}/profesor/planificacion`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                id: asignacion.id,
                link: linkUrl
            })
        });

        if (!resPlan.ok) throw new Error(`Update Planificación fallido: ${resPlan.status}`);
        const planUpdated = await resPlan.json();

        if (planUpdated.planificacion_url === linkUrl) {
            console.log('✅ Enlace de planificación vinculado correctamente.');
        } else {
            console.error('❌ Error: El enlace no se guardó correctamente.');
        }

    } catch (error) {
        // Si falla porque ya existe la asignación única por curso/materia, podríamos buscarla, 
        // pero para prueba rápida asumimos creación o error manejable.
        console.error('⚠️ Error en prueba de planificación (puede ser asignación existente):', error.message);
    }
};

const runTests = async () => {
    await login();
    await updateProfile();
    await testPlanningLink();
};

runTests();
