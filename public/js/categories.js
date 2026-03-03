// Xu ly trang Danh Muc - goi API /api/categories
const messageEl = document.getElementById('message');

// Hien thi thong bao
function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = `message show ${type}`;
    setTimeout(() => messageEl.classList.remove('show'), 3000);
}

// Tai danh sach danh muc va hien thi vao bang
async function loadCategories() {
    try {
        const res = await callApi('GET', '/api/categories');
        const list = document.getElementById('categoryList');

        if (res.data.length === 0) {
            list.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#888">Chưa có danh mục nào</td></tr>';
            return;
        }

        list.innerHTML = res.data.map((cat, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${cat.name}</td>
        <td>${cat.description || '-'}</td>
        <td>${new Date(cat.createdAt).toLocaleDateString('vi-VN')}</td>
        <td>
          <button class="btn btn-warning" onclick="editCategory('${cat._id}', '${cat.name}', '${cat.description || ''}')">Sửa</button>
          <button class="btn btn-danger" onclick="deleteCategory('${cat._id}')">Xoá</button>
        </td>
      </tr>
    `).join('');
    } catch (e) {
        showMessage('Lỗi tải danh mục: ' + e.message, 'error');
    }
}

// Them moi hoac cap nhat danh muc
async function submitForm() {
    const id = document.getElementById('editId').value;
    const name = document.getElementById('name').value.trim();
    const description = document.getElementById('description').value.trim();

    if (!name) {
        showMessage('Vui lòng nhập tên danh mục!', 'error');
        return;
    }

    try {
        if (id) {
            // Cap nhat
            await callApi('PUT', `/api/categories/${id}`, { name, description });
            showMessage('Cập nhật danh mục thành công!', 'success');
        } else {
            // Them moi
            await callApi('POST', '/api/categories', { name, description });
            showMessage('Thêm danh mục thành công!', 'success');
        }
        resetForm();
        loadCategories();
    } catch (e) {
        showMessage('Lỗi: ' + e.message, 'error');
    }
}

// Dien du lieu vao form de chinh sua
function editCategory(id, name, description) {
    document.getElementById('editId').value = id;
    document.getElementById('name').value = name;
    document.getElementById('description').value = description;
    document.getElementById('formTitle').textContent = '✏️ Chỉnh Sửa Danh Mục';
}

// Xoa danh muc
async function deleteCategory(id) {
    if (!confirm('Bạn có chắc muốn xoá danh mục này?')) return;
    try {
        await callApi('DELETE', `/api/categories/${id}`);
        showMessage('Xoá danh mục thành công!', 'success');
        loadCategories();
    } catch (e) {
        showMessage('Lỗi: ' + e.message, 'error');
    }
}

// Reset form ve trang thai them moi
function resetForm() {
    document.getElementById('editId').value = '';
    document.getElementById('name').value = '';
    document.getElementById('description').value = '';
    document.getElementById('formTitle').textContent = '➕ Thêm Danh Mục Mới';
}

// Chay ngay khi load trang
loadCategories();
