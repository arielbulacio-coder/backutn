// Native fetch is available in Node 18+

const API_URL = 'https://backutn.onrender.com';

const users = [
    { email: 'profesor1@utn.com', password: 'profesor123', role: 'profesor' },
    { email: 'director@utn.com', password: 'director123', role: 'director' },
    { email: 'preceptor1@utn.com', password: 'preceptor123', role: 'preceptor' },
    // Admin usually exists, but we can try just in case or skip
];

async function setupCloudUsers() {
    console.log(`📡 Conectando a la nube: ${API_URL}`);

    for (const u of users) {
        try {
            console.log(`Intentando registrar: ${u.email}...`);
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(u)
            });

            if (res.status === 201) {
                console.log(`✅ Usuario creado: ${u.email}`);
            } else if (res.status === 400) {
                const text = await res.text();
                // It might say "El usuario ya existe"
                if (text.includes('ya existe')) {
                    console.log(`ℹ️ El usuario ${u.email} ya existe en la nube.`);
                } else {
                    console.error(`⚠️ Error al crear ${u.email}: ${text}`);
                }
            } else {
                console.error(`❌ Error inesperado (${res.status}) con ${u.email}`);
            }
        } catch (error) {
            console.error(`❌ Error de red con ${u.email}:`, error.message);
        }
    }
}

setupCloudUsers();
