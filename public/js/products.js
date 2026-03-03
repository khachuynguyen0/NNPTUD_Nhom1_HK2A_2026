// Xu ly trang San Pham - goi API /api/products va /api/categories
const messageEl = document.getElementById('message');

function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = `message show ${type}`;
    setTimeout(() => messageEl.classList.remove('show'), 3000);
}

// Tai danh muc vao dropdown select
async function loadCategoryOptions(selectedId = '') {
    try {
        const res = await callApi('GET', '/api/categories');
        const select = document.getElementById('categoryId');
        select.innerHTML = '<option value="">-- Chọn Danh Mục --</option>';
        res.data.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat._id;
            opt.textContent = cat.name;
            if (cat._id === selectedId) opt.selected = true;
            select.appendChild(opt);
        });
    } catch (e) {
        console.error('Loi tai danh muc:', e.message);
    }
}

// Tai danh sach san pham
async function loadProducts() {
    try {
        const res = await callApi('GET', '/api/products');
        const list = document.getElementById('productList');

        if (res.data.length === 0) {
            list.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#888">Chưa có sản phẩm nào</td></tr>';
            return;
        }

        list.innerHTML = res.data.map((p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${p.name}</td>
        <td>${p.price.toLocaleString('vi-VN')} đ</td>
        <td>${p.categoryId ? p.categoryId.name : '-'}</td>
        <td>${p.description || '-'}</td>
        <td>${new Date(p.createdAt).toLocaleDateString('vi-VN')}</td>
        <td>
          <button class="btn btn-warning" onclick="editProduct('${p._id}', '${p.name}', ${p.price}, '${p.categoryId ? p.categoryId._id : ''}', '${p.description || ''}', '${p.image || ''}')">Sửa</button>
          <button class="btn btn-danger" onclick="deleteProduct('${p._id}')">Xoá</button>
        </td>
      </tr>
    `).join('');
    } catch (e) {
        showMessage('Lỗi tải sản phẩm: ' + e.message, 'error');
    }
}

async function submitForm() {
    const id = document.getElementById('editId').value;
    const name = document.getElementById('name').value.trim();
    const price = parseFloat(document.getElementById('price').value);
    const categoryId = document.getElementById('categoryId').value;
    const description = document.getElementById('description').value.trim();
    const image = document.getElementById('image').value.trim();

    if (!name || isNaN(price) || !categoryId) {
        showMessage('Vui lòng điền đủ: Tên, Giá và Danh Mục!', 'error');
        return;
    }

    try {
        const body = { name, price, categoryId, description, image };
        if (id) {
            await callApi('PUT', `/api/products/${id}`, body);
            showMessage('Cập nhật sản phẩm thành công!', 'success');
        } else {
            await callApi('POST', '/api/products', body);
            showMessage('Thêm sản phẩm thành công!', 'success');
        }
        resetForm();
        loadProducts();
    } catch (e) {
        showMessage('Lỗi: ' + e.message, 'error');
    }
}

function editProduct(id, name, price, categoryId, description, image) {
    document.getElementById('editId').value = id;
    document.getElementById('name').value = name;
    document.getElementById('price').value = price;
    document.getElementById('description').value = description;
    document.getElementById('image').value = image;
    document.getElementById('formTitle').textContent = '✏️ Chỉnh Sửa Sản Phẩm';
    loadCategoryOptions(categoryId);
}

async function deleteProduct(id) {
    if (!confirm('Bạn có chắc muốn xoá sản phẩm này?')) return;
    try {
        await callApi('DELETE', `/api/products/${id}`);
        showMessage('Xoá sản phẩm thành công!', 'success');
        loadProducts();
    } catch (e) {
        showMessage('Lỗi: ' + e.message, 'error');
    }
}

function resetForm() {
    document.getElementById('editId').value = '';
    document.getElementById('name').value = '';
    document.getElementById('price').value = '';
    document.getElementById('description').value = '';
    document.getElementById('image').value = '';
    document.getElementById('formTitle').textContent = '➕ Thêm Sản Phẩm Mới';
    loadCategoryOptions();
}

// Khoi dong trang
loadCategoryOptions();
loadProducts();
