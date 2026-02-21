const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const session = require("express-session");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // important for Render free tier
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
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.json({ success: false, message: "Missing fields" });
  }

  const hash = await bcrypt.hash(password, 10);

  db.run(
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    [username, email, hash],
    function (err) {
      if (err) {
        return res.json({ success: false, message: "User already exists" });
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
      if (!user) return res.json({ success: false, message: "Invalid email or password" });

      const match = await bcrypt.compare(password, user.password);

      if (match) {
        req.session.userId = user.id;
        res.json({ success: true });
      } else {
        res.json({ success: false, message: "Invalid email or password" });
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

// Redirect root
app.get("/", (req, res) => {
  if (req.session.userId) {
    res.redirect("/home");
  } else {
    res.redirect("/login.html");
  }
});

// Redirect /login -> login.html
app.get("/login", (req, res) => res.redirect("/login.html"));
app.get("/signup", (req, res) => res.redirect("/signup.html"));

// ✅ New route to get username for navbar
app.get("/username", (req, res) => {
  if (!req.session.userId) return res.json({});
  db.get(
    "SELECT username FROM users WHERE id = ?",
    [req.session.userId],
    (err, row) => {
      if (err || !row) return res.json({});
      res.json({ username: row.username });
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});