const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const session = require("express-session");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
    session({
        secret: "supersecretkey",
        resave: false,
        saveUninitialized: false,
    })
);

// Database setup
const db = new sqlite3.Database("./users.db");

// Load schema if exists
if (fs.existsSync("./schema.sql")) {
    const schema = fs.readFileSync("./schema.sql", "utf8");
    db.exec(schema);
}

// 🔐 Middleware to protect routes
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.redirect("/login.html");
    }
    next();
}

// ================= ROUTES =================

// Signup
app.post("/signup", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.json({ success: false, message: "Missing fields" });

    const hash = await bcrypt.hash(password, 10);

    db.run("INSERT INTO users (email, password) VALUES (?, ?)", [email, hash], function (err) {
        if (err) return res.json({ success: false, message: "User already exists" });
        req.session.userId = this.lastID;
        res.json({ success: true });
    });
});

// Login
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
        if (err) return res.json({ success: false, message: "Database error" });
        if (!user) return res.json({ success: false, message: "Email not found" });

        const match = await bcrypt.compare(password, user.password);
        if (match) {
            req.session.userId = user.id;
            res.json({ success: true });
        } else {
            res.json({ success: false, message: "Incorrect password" });
        }
    });
});

// Logout
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login.html");
    });
});

// Protected home
app.get("/", requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/home", requireAuth, (req, res) => {
    res.redirect("/");
});

// Redirect /login and /signup if already logged in
app.get("/login", (req, res) => {
    if (req.session.userId) return res.redirect("/");
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/signup", (req, res) => {
    if (req.session.userId) return res.redirect("/");
    res.sendFile(path.join(__dirname, "public", "signup.html"));
});

// Start server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));