// Native fetch in Node 18+

// URL PRODUCTION
const API_URL = 'https://backutn.onrender.com';

async function diagnose() {
    try {
        console.log(`Connecting to ${API_URL}...`);

        // 1. Try Login as Default Admin
        const creds = { email: 'admin@utn.com', password: 'ariel2027' }; // Default created by index.js
        console.log('Attempting login with default admin...');

        let loginRes = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(creds)
        });

        if (!loginRes.ok) {
            console.log('Default admin failed. Trying director default...');
            // Try director we just set locally, maybe it synced?
            loginRes = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'director@utn.com', password: 'director' })
            });
        }

        if (!loginRes.ok) {
            console.error('CRITICAL: Could not login to remote server with default credentials.');
            const text = await loginRes.text();
            console.error(`Status: ${loginRes.status} | Body: ${text}`);
            return;
        }

        const data = await loginRes.json();
        const token = data.token;
        console.log(`Login SUCCESS. User: ${data.user.email}, Role: ${data.user.role}`);

        // 2. Fetch Users
        console.log('Fetching /users...');
        const usersRes = await fetch(`${API_URL}/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!usersRes.ok) {
            console.error(`Failed to fetch users. Status: ${usersRes.status}`);
            const t = await usersRes.text();
            console.error(t);
            return;
        }

        const users = await usersRes.json();
        console.log(`Total Users in Production: ${users.length}`);

        const profs = users.filter(u => u.role === 'profesor');
        console.log(`Professors count: ${profs.length}`);
        profs.forEach(p => console.log(` - ${p.email} [${p.role}]`));

        if (profs.length === 0) {
            console.log('!!! NO PROFESSORS FOUND IN PRODUCTION !!!');
            // 3. Try fallback seed if available

        }

    } catch (e) {
        console.error('Script Error:', e);
    }
}

diagnose();
