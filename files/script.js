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

// Load schema
const schema = fs.readFileSync("./schema.sql", "utf8");
db.exec(schema);

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

    if (!email || !password) {
        return res.json({ success: false, message: "Missing fields" });
    }

    const hash = await bcrypt.hash(password, 10);

    db.run(
        "INSERT INTO users (email, password) VALUES (?, ?)",
        [email, hash],
        function (err) {
            if (err) {
                return res.json({ success: false, message: "User exists" });
            }
            req.session.userId = this.lastID;
            res.json({ success: true });
        }
    );
});

// Login
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.get(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, user) => {
            if (!user) return res.json({ success: false });

            const match = await bcrypt.compare(password, user.password);

            if (match) {
                req.session.userId = user.id;
                res.json({ success: true });
            } else {
                res.json({ success: false });
            }
        }
    );
});

// Logout
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login.html");
    });
});

// Protected Home Route
app.get("/home", requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});
// Redirect root to home
app.get("/", (req, res) => {
    if (req.session.userId) {
        res.redirect("/home");
    } else {
        res.redirect("/login.html");
    }
});

//redirect /login -> /login.html
app.get("/login", (req, res) => {
    res.redirect("/login.html");
});

// Optional: redirect /signup -> /signup.html
app.get("/signup", (req, res) => {
    res.redirect("/signup.html");
});
// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});