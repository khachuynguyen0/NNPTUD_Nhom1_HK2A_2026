// Script tao tai khoan admin mac dinh neu chua ton tai
// Chay tu dong khi server khoi dong

const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function seedAdmin() {
    try {
        // Kiem tra xem da co tk admin chua
        const existing = await User.findOne({ username: 'admin' });

        if (existing) {
            console.log('[Seed] Tai khoan admin da ton tai, bo qua.');
            return;
        }

        // Ma hoa mat khau
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);

        // Tao tai khoan admin
        const admin = new User({
            username: 'admin',
            email: 'admin@loanspa.com',
            password: hashedPassword,
            role: 'admin',
            points: 0
        });

        await admin.save();
        console.log('[Seed] Da tao tai khoan admin mac dinh: admin / 123456');

    } catch (err) {
        console.error('[Seed] Loi khi tao admin:', err.message);
    }
}

module.exports = seedAdmin;
