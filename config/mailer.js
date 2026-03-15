// Cau hinh nodemailer de gui email thong bao
const nodemailer = require('nodemailer');

// Tao transporter dung Gmail (SMTP)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

// Ham gui email xac nhan lich hen den khach hang
async function sendConfirmEmail({ toEmail, customerName, serviceName, appointmentDate }) {
    const dateStr = new Date(appointmentDate).toLocaleString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    const mailOptions = {
        from: `"Loan Spa 🌸" <${process.env.MAIL_USER}>`,
        to: toEmail,
        subject: '✅ Loan Spa - Lịch Hẹn Của Bạn Đã Được Xác Nhận!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #fff5f7; border-radius: 12px; overflow: hidden; border: 1px solid #fce4ec;">
                <div style="background: linear-gradient(135deg, #e91e8c, #f48fb1); padding: 28px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 1.6rem;">🌸 Loan Spa</h1>
                    <p style="color: #ffe0eb; margin: 6px 0 0; font-size: 0.9rem;">Hệ thống quản lý tiệm spa</p>
                </div>
                <div style="padding: 28px 32px;">
                    <h2 style="color: #c2185b; margin-bottom: 8px;">Xin chào, ${customerName}! 👋</h2>
                    <p style="color: #555; line-height: 1.6;">
                        Lịch hẹn của bạn đã được <strong style="color: #2e7d32;">xác nhận</strong>. Chúng tôi rất vui được phục vụ bạn!
                    </p>
                    <div style="background: white; border-radius: 10px; padding: 20px; margin: 20px 0; border: 1px solid #fce4ec;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #888; font-size: 0.88rem;">💆 Dịch vụ</td>
                                <td style="padding: 8px 0; font-weight: bold; color: #333;">${serviceName}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #888; font-size: 0.88rem;">📅 Thời gian</td>
                                <td style="padding: 8px 0; font-weight: bold; color: #333;">${dateStr}</td>
                            </tr>
                        </table>
                    </div>
                    <p style="color: #555; font-size: 0.88rem; line-height: 1.6;">
                        Nếu cần thay đổi hoặc hủy lịch, vui lòng liên hệ với chúng tôi ít nhất <strong>2 giờ</strong> trước giờ hẹn.
                    </p>
                    <div style="background: #fce4ec; border-radius: 8px; padding: 14px; margin-top: 20px; text-align: center; font-size: 0.88rem; color: #c2185b;">
                        📍 123 Đường Hoa Hồng, TP. Hồ Chí Minh &nbsp;|&nbsp; 📞 0901 234 567
                    </div>
                </div>
                <div style="background: #c2185b; padding: 14px; text-align: center;">
                    <p style="color: #ffe0eb; margin: 0; font-size: 0.8rem;">🌸 Loan Spa © 2026 — Vẻ đẹp của bạn là niềm hạnh phúc của chúng tôi</p>
                </div>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Mailer] Da gui email xac nhan den: ${toEmail}`);
}

module.exports = { sendConfirmEmail };
