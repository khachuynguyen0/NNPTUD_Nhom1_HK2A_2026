# NNPTUD Nhóm 1 - HK2A 2026

**Ngôn Ngữ Phát Triển Ứng Dụng** - Bài tập nhóm

## Công Nghệ

| Phần | Công nghệ |
|------|-----------|
| Backend | Node.js + Express (API RESTful) |
| Database | MongoDB Atlas (Mongoose) |
| Frontend | HTML / CSS / JavaScript thuần |

---

## Cấu Trúc Project

```
NNPTUD_Nhom1_HK2A_2026/
├── bin/www                    ← Entry point (express-generator)
├── config/
│   └── db.js                  ← Kết nối MongoDB Atlas
├── controllers/               ← Xử lý logic nghiệp vụ
│   ├── categoriesController.js
│   ├── productsController.js
│   └── usersController.js
├── models/                    ← Mongoose schemas
│   ├── Category.js
│   ├── Product.js
│   └── User.js
├── routes/                    ← API endpoints
│   ├── index.js               ← GET /api
│   ├── categories.js          ← /api/categories
│   ├── products.js            ← /api/products
│   └── users.js               ← /api/users
├── middlewares/
│   └── errorHandler.js        ← Xử lý lỗi toàn cục
├── public/                    ← Frontend (được serve tĩnh)
│   ├── index.html             ← Trang chủ
│   ├── css/style.css
│   ├── js/
│   │   ├── api.js             ← Hàm callApi() dùng chung
│   │   ├── categories.js
│   │   ├── products.js
│   │   └── users.js
│   └── pages/
│       ├── categories.html
│       ├── products.html
│       └── users.html
├── .env                       ← Biến môi trường (PORT, MONGODB_URI)
├── app.js                     ← Cấu hình Express
└── package.json
```

---

## Cài Đặt & Chạy

### 1. Cài Dependencies
```bash
npm install
```

### 2. Cấu Hình MongoDB Atlas
Mở file `.env` và điền thông tin thực tế:
```
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority
```

### 3. Chạy Server
```bash
npm start
```
> Server tự động restart khi có thay đổi code (nhờ nodemon)

### 4. Truy Cập
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/api

---

## API Endpoints

### Categories
| Method | URL | Mô tả |
|--------|-----|-------|
| GET | `/api/categories` | Lấy tất cả danh mục |
| GET | `/api/categories/:id` | Lấy 1 danh mục |
| POST | `/api/categories` | Tạo danh mục mới |
| PUT | `/api/categories/:id` | Cập nhật danh mục |
| DELETE | `/api/categories/:id` | Xoá danh mục |
| GET | `/api/categories/:id/products` | Lấy sản phẩm theo danh mục |

### Products
| Method | URL | Mô tả |
|--------|-----|-------|
| GET | `/api/products` | Lấy tất cả sản phẩm |
| GET | `/api/products/:id` | Lấy 1 sản phẩm |
| POST | `/api/products` | Tạo sản phẩm mới |
| PUT | `/api/products/:id` | Cập nhật sản phẩm |
| DELETE | `/api/products/:id` | Xoá sản phẩm |

### Users
| Method | URL | Mô tả |
|--------|-----|-------|
| GET | `/api/users` | Lấy tất cả người dùng |
| GET | `/api/users/:id` | Lấy 1 người dùng |
| POST | `/api/users` | Tạo người dùng mới |
| PUT | `/api/users/:id` | Cập nhật người dùng |
| DELETE | `/api/users/:id` | Xoá người dùng |

---

## Ví Dụ Request (Postman / Fetch)

```js
// Tao danh muc moi
fetch('http://localhost:3000/api/categories', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Điện tử', description: 'Sản phẩm điện tử' })
})
```

---

*NNPTUD Nhóm 1 - HK2A 2026 | Giảng viên: Thầy Tùng*