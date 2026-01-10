require('dotenv').config();

const API_URL = 'http://127.0.0.1:10000';

async function testDirector() {
    try {
        console.log('1. Login Director...');
        const loginRes = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'director@utn.com', password: 'director' })
        });

        if (!loginRes.ok) {
            const text = await loginRes.text();
            throw new Error(`Login Failed: ${loginRes.status} - ${text}`);
        }

        const { token, user } = await loginRes.json();
        console.log(`Logged in as: ${user.email} (${user.role})`);

        console.log('2. Fetch Users...');
        const usersRes = await fetch(`${API_URL}/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!usersRes.ok) throw new Error(`Fetch Users Failed: ${usersRes.status}`);

        const users = await usersRes.json();
        console.log(`Fetched ${users.length} users.`);
        const profs = users.filter(u => u.role === 'profesor');
        console.log(`Professors found: ${profs.length}`);
        profs.forEach(p => console.log(` - ${p.email}`));

    } catch (e) {
        console.error(e.message);
    }
}
testDirector();
