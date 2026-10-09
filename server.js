const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Database
const db = new sqlite3.Database("./coffee.db");

// Create table and add initial coffee data
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS coffees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            votes INTEGER DEFAULT 0
        )
    `);

    db.get("SELECT COUNT(*) AS count FROM coffees", (err, row) => {
        if (err) {
            console.error(err);
            return;
        }

        if (row.count === 0) {
            const coffees = [
                ["Arabica Classic", "Smooth and rich with a balanced flavor.", 0],
                ["Mocha Delight", "Chocolatey coffee with a sweet finish.", 0],
                ["Caramel Brew", "A delicious blend with caramel notes.", 0],
                ["Espresso Strong", "Bold and intense coffee for espresso lovers.", 0],
                ["Vanilla Latte", "Creamy coffee with a gentle vanilla flavor.", 0]
            ];

            const statement = db.prepare(
                "INSERT INTO coffees (name, description, votes) VALUES (?, ?, ?)"
            );

            coffees.forEach(coffee => {
                statement.run(coffee);
            });

            statement.finalize();
        }
    });
});

// Get all coffees
app.get("/api/coffees", (req, res) => {
    db.all(
        "SELECT * FROM coffees ORDER BY votes DESC",
        [],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json(rows);
        }
    );
});

// Vote for a coffee
app.post("/api/coffees/:id/vote", (req, res) => {
    const id = req.params.id;

    db.run(
        "UPDATE coffees SET votes = votes + 1 WHERE id = ?",
        [id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: "Coffee not found" });
            }

            db.get(
                "SELECT * FROM coffees WHERE id = ?",
                [id],
                (err, coffee) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }

                    res.json(coffee);
                }
            );
        }
    );
});

// Start server
app.listen(PORT, () => {
    console.log(`Coffee Rating App running on http://localhost:${PORT}`);
});