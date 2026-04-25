
async function test() {
    try {
        const res = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'Admin@123' })
        });
        console.log('STATUS_CODE:', res.status);
        const data = await res.json();
        console.log('RESPONSE_BODY:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('ERROR:', e);
    }
}
test();
