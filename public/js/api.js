// Ham tien ich goi API - dung chung cho tat ca cac trang
const API_BASE = 'http://localhost:3000';

/**
 * Goi API RESTful
 * @param {string} method - GET, POST, PUT, DELETE
 * @param {string} endpoint - duong dan API, vd: /api/categories
 * @param {object} body - du lieu gui len (voi POST, PUT)
 * @returns {object} - du lieu JSON tu server
 */
async function callApi(method, endpoint, body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();

    // Neu server tra ve loi thi nem ra de xu ly ben ngoai
    if (!response.ok) {
        throw new Error(data.message || 'Loi khong xac dinh');
    }

    return data;
}
