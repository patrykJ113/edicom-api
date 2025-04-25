# 🚀 Edicom Api

This is the main api for the 👉 [Edicom project](https://github.com/patrykJ113/edicom)

## 📦 Installation & Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/patrykJ113/edicom-api.git
   ```
2. install dependencies:
   ```bash
   npm ci
   ```
3. 🔐 Generate a Self-Signed SSL Certificate
   ```bash
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout key.pem -out cert.pem -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
   ```
4. 🛠️ Create a new database if it doesn’t exist:
   ```bash
   npx prisma migrate dev
   ```
5. start api:
   ```bash
   npm run dev
   ```
## Usage

After running the app, navigate to http://localhost:4000 in your browser.
