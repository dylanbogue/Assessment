

const express = require("express");
const app = express();
const path = require("path");
const mysql = require('mysql2');

//middleware
app.use(express.static(path.join(__dirname, './public')));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

//database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',    //XAMMP ""
    database: 'tradethecart',
    port: '3306',        //XAMPP 3306
});


//routes
app.get("/", (req, res) => {

    res.render('landing');
});

app.get("/browse", (req, res) => {

    res.render("browse");

});

app.get("/signup", (req, res) => {

    res.render("signup");

});


app.post("/signup", async (req, res) => {

    const username = req.body.username
    const email = req.body.email
    const password = req.body.password
    
    try {
        const sqlinsert = `INSERT INTO users (username, email, password) VALUES ('${username}', '${email}', '${password}');`;                           
        db.query(sqlinsert, [username, email, password], (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
            } else {
                res.status(201).send('User created successfully!');
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});



// Login Route

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const sql = 'SELECT id, username, password FROM users WHERE username = ?';
    db.query(sql, [username], (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        } else if (results.length > 0) {
            const storedPassword = results[0].password;

            if (password === storedPassword) {
                res.status(200).send(`Login successful! Welcome, ${results[0].username} to TradetheCart!`);
            } else {
                res.status(401).send('Incorrect password. Please try again.');
            }
        } else {
            res.status(404).send('Username not found. Please check your username or sign up.');
        }
    });
});











//server
app.listen(process.env.PORT || 3000, () => {
    
    console.log(" Server is listening on localhost:3000/ ");

})