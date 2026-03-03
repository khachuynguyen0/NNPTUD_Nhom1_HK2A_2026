// Xu ly trang Nguoi Dung - goi API /api/users
const messageEl = document.getElementById('message');

function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = `message show ${type}`;
    setTimeout(() => messageEl.classList.remove('show'), 3000);
}

async function loadUsers() {
    try {
        const res = await callApi('GET', '/api/users');
        const list = document.getElementById('userList');

        if (res.data.length === 0) {
            list.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#888">Chưa có người dùng nào</td></tr>';
            return;
        }

        list.innerHTML = res.data.map((u, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${u.username}</td>
        <td>${u.email}</td>
        <td><span style="padding:3px 8px;border-radius:4px;background:${u.role === 'admin' ? '#e74c3c' : '#3498db'};color:white;font-size:0.8rem">${u.role}</span></td>
        <td>${new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
        <td>
          <button class="btn btn-warning" onclick="editUser('${u._id}', '${u.username}', '${u.email}', '${u.role}')">Sửa</button>
          <button class="btn btn-danger" onclick="deleteUser('${u._id}')">Xoá</button>
        </td>
      </tr>
    `).join('');
    } catch (e) {
        showMessage('Lỗi tải người dùng: ' + e.message, 'error');
    }
}

async function submitForm() {
    const id = document.getElementById('editId').value;
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    if (!username || !email) {
        showMessage('Vui lòng điền username và email!', 'error');
        return;
    }

    if (!id && !password) {
        showMessage('Vui lòng điền mật khẩu!', 'error');
        return;
    }

    try {
        if (id) {
            // Cap nhat (chi cap nhat username, email, role - khong doi password)
            await callApi('PUT', `/api/users/${id}`, { username, email, role });
            showMessage('Cập nhật người dùng thành công!', 'success');
        } else {
            await callApi('POST', '/api/users', { username, email, password, role });
            showMessage('Thêm người dùng thành công!', 'success');
        }
        resetForm();
        loadUsers();
    } catch (e) {
        showMessage('Lỗi: ' + e.message, 'error');
    }
}

function editUser(id, username, email, role) {
    document.getElementById('editId').value = id;
    document.getElementById('username').value = username;
    document.getElementById('email').value = email;
    document.getElementById('role').value = role;
    document.getElementById('password').value = '';
    document.getElementById('password').placeholder = 'Không thay đổi password';
    document.getElementById('formTitle').textContent = '✏️ Chỉnh Sửa Người Dùng';
}

async function deleteUser(id) {
    if (!confirm('Bạn có chắc muốn xoá người dùng này?')) return;
    try {
        await callApi('DELETE', `/api/users/${id}`);
        showMessage('Xoá người dùng thành công!', 'success');
        loadUsers();
    } catch (e) {
        showMessage('Lỗi: ' + e.message, 'error');
    }
}

function resetForm() {
    document.getElementById('editId').value = '';
    document.getElementById('username').value = '';
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password').placeholder = 'Mật khẩu *';
    document.getElementById('role').value = 'user';
    document.getElementById('formTitle').textContent = '➕ Thêm Người Dùng Mới';
}

loadUsers();
