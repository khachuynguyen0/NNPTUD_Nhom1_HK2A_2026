// Ham goi API dung chung cho tat ca cac trang
// Su dung: callApi('GET', '/api/products') hoac callApi('POST', '/api/auth/login', body)

const BASE_URL = '';

// ========== TOKEN HELPERS ==========

// Lay token tu localStorage
function getToken() {
    return localStorage.getItem('token');
}

// Lay role cua user dang dang nhap
function getRole() {
    return localStorage.getItem('role');
}

// Lay ten dang nhap
function getUsername() {
    return localStorage.getItem('username');
}

// Kiem tra da dang nhap chua
function isLoggedIn() {
    return !!getToken();
}

// Kiem tra co phai admin khong
function isAdmin() {
    return getRole() === 'admin';
}

// Dang xuat: xoa localStorage va chuyen ve trang chu
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    window.location.href = '/';
}

// Bao ve trang chi danh cho admin — goi o dau trang can bao ve
function requireAdmin() {
    if (!isLoggedIn() || !isAdmin()) {
        window.location.href = '/pages/login.html?redirect=' + encodeURIComponent(window.location.pathname);
    }
}

// ========== HAM GOI API CHINH ==========

async function callApi(method, url, body = null) {
    const options = {
        method: method,
        headers: { 'Content-Type': 'application/json' },
    };

    // Tu dong gan token neu co
    const token = getToken();
    if (token) {
        options.headers['Authorization'] = 'Bearer ' + token;
    }

    if (body) {
        options.body = JSON.stringify(body);
    }

    const res = await fetch(BASE_URL + url, options);
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || 'Loi khong xac dinh');
    }

    return data;
}

// Ham gui request co file (FormData) — cung tu dong gan token
async function callApiForm(method, url, formData) {
    const token = getToken();
    const headers = {};
    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }
    // Khong set Content-Type de browser tu xet multipart/form-data

    const res = await fetch(BASE_URL + url, {
        method: method,
        headers: headers,
        body: formData
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || 'Loi khong xac dinh');
    }
    return data;
}

// ========== RENDER NAV AUTH ==========
// Goi ham nay o cuoi the <body> cua moi trang de hien thi trang thai dang nhap

function renderAuthNav() {
    const container = document.getElementById('authNav');
    if (!container) return;

    if (isLoggedIn()) {
        // Nut quan tri chi hien voi admin
        const adminBtn = isAdmin()
            ? `<a href="/pages/admin.html" class="btn btn-sm btn-admin">⚙️ Quản Trị</a>`
            : '';

        container.innerHTML = `
            ${adminBtn}
            <a href="/pages/my-bookings.html" class="nav-link" style="padding:8px 14px;">📋 Lịch Của Tôi</a>
            <span class="nav-user">👤 ${getUsername()}</span>
            <button class="btn btn-sm btn-outline" onclick="logout()">Đăng Xuất</button>
        `;
    } else {
        // Hien nut dang nhap
        container.innerHTML = `
            <a href="/pages/login.html" class="btn btn-sm">🔐 Đăng Nhập</a>
        `;
    }
}
