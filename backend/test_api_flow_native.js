require('dotenv').config();

const API_URL = 'http://127.0.0.1:10000';

async function testFlow() {
    try {
        console.log('1. Attempting Login as profesor1@utn.com...');
        const loginRes = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'profesor1@utn.com',
                password: 'profesor1'
            })
        });

        if (!loginRes.ok) {
            const errBody = await loginRes.text();
            throw new Error(`Login Failed: ${loginRes.status} ${loginRes.statusText} - ${errBody}`);
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Login Successful. Token received.');
        console.log('User Role:', loginData.user.role);

        console.log('\n2. Fetching Assignments...');
        const assignRes = await fetch(`${API_URL}/profesor/me/asignaciones`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!assignRes.ok) {
            const errText = await assignRes.text();
            throw new Error(`Fetch Assignments Failed: ${assignRes.status} ${errText}`);
        }

        const assignData = await assignRes.json();
        console.log('Assignments Response Status:', assignRes.status);
        console.log('Assignments Data:', JSON.stringify(assignData, null, 2));

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testFlow();
