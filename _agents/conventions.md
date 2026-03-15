---
description: Quy tac va luu y chung cho project Quan Ly Tiem Spa - Loan Spa
---

# Lưu Ý Project - Quản Lý Tiệm Spa (Loan Spa)


## BackEnd

- Mo hinh: **API RESTful tra JSON** — KHONG dung MVC/View
- Ngon ngu: Node.js + Express
- Database: **MongoDB Atlas** (Mongoose)
- Cau truc folder theo mau thay:
  ```
  npm i express-generator -g
  npm i express
  express --view=ejs --git    (bam y khi hoi)
  npm i nodemon
  npm i
  ```
- Script start trong `package.json`: `nodemon ./bin/www`
- Chay bang: `npm start`
- Trien khai theo: `config/` → `models/` → `controllers/` → `routes/`

## FrontEnd

- Dung **HTML/CSS/JS thuan** (Native), khong framework
- Goi API da viet o backend thong qua `fetch`
- File dung chung: `public/js/api.js` chua ham `callApi()`

## Quy Tac Code

- Code gon gang, don gian, de hieu, de bao tri
- **Comment**: Tieng Viet KHONG DAU (vd: `// xu ly loi`, `// lay danh sach`)
- **Chat voi user**: Tieng Viet co dau
- **Log day du**: moi controller phai `console.log` va `console.error` ro rang
- Xem code truoc khi sua de tranh mat chuc nang cu
- Cap nhat gia tri khi co thay doi (port, URI, ten collection...)
- Can than, khong lam mat cac chuc nang dang co

## Ket Noi MongoDB

- URI luu trong `.env`: `MONGODB_URI=mongodb+srv://...`
- Ham ket noi: `config/db.js`
- Bat trong `app.js` khi da co URI that:
  ```js
  require('dotenv').config();
  const connectDB = require('./config/db');
  connectDB();
  ```
- **Phase hien tai**: DA ket noi Mongo Atlas — dotenv va connectDB da bat trong `app.js`

## API Endpoints Hien Co

| Method | URL | Chuc nang |
|--------|-----|-----------|
| GET | `/api` | Kiem tra server |
| POST | `/api/auth/register` | Dang ky tai khoan (role mac dinh: user) |
| POST | `/api/auth/login` | Dang nhap — tra ve JWT token |
| POST | `/api/auth/google` | Dang nhap / Dang ky bang Google OAuth2 |
| GET | `/api/auth/me` | Lay thong tin user hien tai (can token) |
| GET | `/api/auth/google-client-id` | Lay Google Client ID cho frontend |
| GET/POST | `/api/categories` | Danh muc |
| GET/PUT/DELETE | `/api/categories/:id` | 1 danh muc |
| GET | `/api/categories/:id/products` | San pham theo danh muc |
| GET/POST | `/api/products` | San pham/dich vu (POST can quyen admin) |
| GET/PUT/DELETE | `/api/products/:id` | 1 san pham (PUT/DELETE can quyen admin) |
| GET/POST | `/api/users` | Nguoi dung (can admin) |
| GET/PUT/DELETE | `/api/users/:id` | 1 nguoi dung (can admin) |
| GET/POST | `/api/appointments` | Lich hen |
| GET/PUT/DELETE | `/api/appointments/:id` | 1 lich hen |
| POST | `/api/payments/pay/:id` | Admin xac nhan thanh toan + cong diem |
| POST | `/api/payments/redeem-voucher` | User dung diem doi voucher (can token) |
| GET | `/api/payments/vouchers` | Lay voucher dang hoat dong (public) |
| GET | `/api/payments/vouchers/all` | Admin lay tat ca voucher |
| POST | `/api/payments/vouchers` | Admin tao voucher moi |
| PUT | `/api/payments/vouchers/:code` | Admin cap nhat voucher |
| DELETE | `/api/payments/vouchers/:code` | Admin xoa voucher |
| POST | `/api/payments/add-points` | Admin cong diem thu cong cho user |

## Chay Project

```bash
npm start         # chay server (nodemon tu dong restart)
# Mo trinh duyet: http://localhost:3000
```

## Frontend Pages

| Duong dan | File | Chuc nang |
|-----------|------|-----------|
| `/` | `public/index.html` | Trang chu, gioi thieu doanh nghiep |
| `/pages/login.html` | `public/pages/login.html` | Dang nhap (username/password + Google) |
| `/pages/register.html` | `public/pages/register.html` | Dang ky (username/password + Google) |
| `/pages/profile.html` | `public/pages/profile.html` | Ho so ca nhan: diem, vi voucher, doi voucher |
| `/pages/admin.html` | `public/pages/admin.html` | Quan tri Admin: Dich vu, Tai khoan, Voucher |
| `/pages/services.html` | `public/pages/services.html` | Danh sach dich vu, CRUD chi Admin |
| `/pages/add-service.html` | `public/pages/add-service.html` | Them dich vu moi, chi Admin truy cap |
| `/pages/booking.html` | `public/pages/booking.html` | Form dat lich hen |

- File JS dung chung: `public/js/api.js` — ham `callApi`, `callApiForm`, `renderAuthNav`, `requireAdmin`, `logout`
- Token JWT duoc luu trong `localStorage`: key `token`, `role`, `username`, `userId`
- Tai khoan admin mac dinh: `admin / 123456` (tu dong tao qua `scripts/seedAdmin.js`)
