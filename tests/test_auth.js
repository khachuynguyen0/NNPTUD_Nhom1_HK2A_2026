const axios = require('axios');
const API = 'http://localhost:3000/api';

async function runTests() {
    try {
        console.log('--- START TESTING ---');

        // 1. Dang ky admin
        console.log('\n[Test 1] Dang ky admin...');
        try {
            await axios.post(`${API}/auth/register`, {
                username: 'admin',
                email: 'admin@loanspa.com',
                password: 'password123'
            });
            console.log('Dang ky thanh cong');
        } catch(e) {
            console.log('Da ton tai tk admin');
        }

        // Dang nhap admin lay token
        const loginRes = await axios.post(`${API}/auth/login`, {
            username: 'admin',
            password: 'password123'
        });
        const adminToken = loginRes.data.token;
        
        // set admin trong db
        console.log('--- LUY Y ---');
        console.log('De test tiep cac chuc nang Admin, ban can vao MongoDB Atlas (hoac dung Compass), sua document cua user "admin" -> role: "admin" nhe.');

        console.log('Login Admin Thanh Cong. Token:', adminToken.substring(0, 15) + '...');

        // 2. Dang ky user thuong
        console.log('\n[Test 2] Dang ky user thuong...');
        try {
            await axios.post(`${API}/auth/register`, {
                username: 'khachhang1',
                email: 'khach@gmail.com',
                password: 'password123'
            });
            console.log('Dang ky User thanh cong');
        } catch(e) {
            console.log('Da ton tai tk khachhang1');
        }

        const userLoginRes = await axios.post(`${API}/auth/login`, {
            username: 'khachhang1',
            password: 'password123'
        });
        const userToken = userLoginRes.data.token;
        console.log('Login User Thanh Cong. Token:', userToken.substring(0, 15) + '...');

        // 3. User thuong thep danh muc -> Bi tu choi
        console.log('\n[Test 3] User thuong them danh muc...');
        try {
             await axios.post(`${API}/categories`, {
                name: 'Thu nghiem role',
                description: 'test'
            }, {
                headers: { Authorization: `Bearer ${userToken}`}
            });
            console.log('[Loi] Tu nhien nguoi dung binh thuong that them duoc?');
        } catch (e) {
            console.log('Dung nhu du doan -> Bi tu choi quyen (403). Status:', e.response?.status);
        }

        console.log('\n--- TESTS DONE ---');

    } catch(err) {
        console.log('Loi test:', JSON.stringify(err.response?.data) || err.message);
    }
}

// Chay test (Khong can ket noi DB truc tiep vi thong qua HTTP req den server ban dang bat)
runTests();
