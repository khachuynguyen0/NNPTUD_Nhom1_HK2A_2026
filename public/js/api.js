// Ham goi API dung chung cho tat ca cac trang
// Su dung: callApi('GET', '/api/products') hoac callApi('POST', '/api/appointments', body)

const BASE_URL = '';

async function callApi(method, url, body = null) {
    const options = {
        method: method,
        headers: { 'Content-Type': 'application/json' },
    };

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
