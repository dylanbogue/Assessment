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

db.connect((err) =>  {
    if(err) return console.log(err.message);
    console.log("connected to local mysql db")
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

// browse route 
 app.post("/browse", (req, res) => {
    const username = req.body.username;

    const sql = `SELECT * FROM users WHERE username = '${username}';`;
    db.query(sql, (error, results) => {
        if (error) throw error;
            // console.error(error);
            //res.status(500).send('Internal Server Error');
            //} 
          else if (results.length > 0) {
            // User found in the database, render the browse_cards template
           

        } else {
            // Username not found
            
            res.redirect(`/signup?invalidUsername=${username}`);            
        }
    });
});

//all new 

app.get("/user_cards", (req, res) => {
    const username = req.query.username; // Change to req.query to get the username from the query string

    const cardSql = `SELECT u.username, c.img_low
                    FROM users u
                    LEFT JOIN card c ON u.user_id = c.user_id
                    WHERE u.username = '${username}';`;

    db.query(cardSql, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.render('user_cards', { results });
        }
    });
});

    








//server
app.listen(process.env.PORT || 3000, () => {
    
    console.log(" Server is listening on localhost:3000/ ");

});