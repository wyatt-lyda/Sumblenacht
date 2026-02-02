const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static("public"));

// Database setup
const db = new sqlite3.Database("./users.db");

// Load schema.sql
const schemaPath = path.join(__dirname, "schema.sql");
const schema = fs.readFileSync(schemaPath, "utf8");

db.exec(schema, (err) => {
    if (err) {
        console.error("Failed to load schema:", err);
    } else {
        console.log("Database ready");
    }
});

// TEMP: Create a test user if none exists
const testEmail = "test@example.com";
const testPassword = "password123";

db.get("SELECT * FROM users WHERE email = ?", [testEmail], async (err, row) => {
    if (!row) {
        const hash = await bcrypt.hash(testPassword, 10);
        db.run(
            "INSERT INTO users (email, password) VALUES (?, ?)",
            [testEmail, hash]
        );
        console.log("Test user created");
    }
});

// Login route
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ success: false, message: "Missing fields" });
    }

    db.get(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, user) => {
            if (err || !user) {
                return res.json({ success: false });
            }

            const match = await bcrypt.compare(password, user.password);
            res.json({ success: match });
        }
    );
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
