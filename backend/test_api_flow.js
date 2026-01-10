const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:3000'; // Assuming local backend port

async function testFlow() {
    try {
        console.log('1. Attempting Login as profesor1@utn.com...');
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: 'profesor1@utn.com',
            password: 'profesor1' // Assuming this is the password
        });

        const token = loginRes.data.token;
        console.log('Login Successful. Token received.');
        console.log('User Role:', loginRes.data.user.role);

        console.log('\n2. Fetching Assignments...');
        try {
            const assignRes = await axios.get(`${API_URL}/profesor/me/asignaciones`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Assignments Response Status:', assignRes.status);
            console.log('Assignments Data:', JSON.stringify(assignRes.data, null, 2));
        } catch (err) {
            console.error('Error fetching assignments:', err.response ? err.response.data : err.message);
        }

    } catch (error) {
        console.error('Login Failed:', error.response ? error.response.data : error.message);
    }
}

testFlow();
