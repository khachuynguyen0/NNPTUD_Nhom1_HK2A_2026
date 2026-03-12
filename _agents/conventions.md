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
| GET/POST | `/api/categories` | Danh muc |
| GET/PUT/DELETE | `/api/categories/:id` | 1 danh muc |
| GET | `/api/categories/:id/products` | San pham theo danh muc |
| GET/POST | `/api/products` | San pham |
| GET/PUT/DELETE | `/api/products/:id` | 1 san pham |
| GET/POST | `/api/users` | Nguoi dung |
| GET/PUT/DELETE | `/api/users/:id` | 1 nguoi dung |
| GET/POST | `/api/appointments` | Lich hen |
| GET/PUT/DELETE | `/api/appointments/:id` | 1 lich hen |

## Chay Project

```bash
npm start         # chay server (nodemon tu dong restart)
# Mo trinh duyet: http://localhost:3000
```

## Frontend Pages

| Duong dan | File | Chuc nang |
|-----------|------|-----------|
| `/` | `public/index.html` | Trang chu, gioi thieu doanh nghiep |
| `/pages/services.html` | `public/pages/services.html` | Danh sach dich vu, CRUD (them/sua/xoa) |
| `/pages/booking.html` | `public/pages/booking.html` | Form dat lich hen |

- File JS dung chung: `public/js/api.js` — ham `callApi(method, url, body)`
