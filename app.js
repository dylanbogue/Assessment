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
        db.query(sqlinsert, [username, email, password], (error) => {
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

    const sql = 'SELECT user_id, username, password FROM users WHERE username = ?';
    db.query(sql, [username], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Internal Server Error');
        }

        if (results.length === 0) {
            return res.status(404).send('Username not found. Please check your username or sign up.');
        }

        //gets user password
        const storedPassword = results[0].password;

        //compares entered password to correct password
        if (password === storedPassword) {
            res.redirect(`/user_cards?username=${username}`);
            
            // res.render("user_cards", { username: username, results: [
            //     {name: username, img_low: "https://assets.tcgdex.net/en/base/base1/1/low.webp"}
            // ]});
            return;
        } else {
            return res.status(401).send('Incorrect password. Please try again.');
        }
    });
});

app.get("/user_cards", (req, res) => {
    const username = req.query.username; // Change to req.query to get the username from the query string

    const cardSql = `SELECT u.username, c.img_low
                    FROM users u
                    LEFT JOIN card c ON u.user_id = c.user_id
                    WHERE u.username = ?;`;

    db.query(cardSql, [username], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.render('user_cards', { username: username , results: results});
        }
    });
});

app.get("/add_card", (req, res) => {
    const username = req.query.username
    res.render('add_card', {username: username});
})

app.post("/add_card", (req, res) => {
    const cardName = req.body.cardName; // Change to req.query to get the username from the query string

    // const sql = "INSERT INTO `card`(`card_id`, `name`, `set_name`, `img_low`, `img_high`, `hp`, `stage`, `attack`, `user_id`) VALUES (?,?,?,?,?,?,?,?,?)";
    const sql = "INSERT INTO `card` (`card_id`, `name`, `set_name`, `img_low`, `img_high`, `hp`, `stage`, `attack`, `user_id`) VALUES (NULL, 'Dark Charizard', 'Team Rocket', 'https://assets.tcgdex.net/en/base/base5/21/low.webp', 'https://assets.tcgdex.net/en/base/base5/21/high.webp', '80', 'Stage 2', 'Seemingly possessed, it spews fire like a volcano, trying to burn all it sees.  ', '2');"
    db.query(sql, [], (error, results) => {
        if(error) {
            return res.status(401).send('Failure Adding Card');
        }
        res.redirect(`user_cards?username=${username}`);
    })
});





//server
app.listen(process.env.PORT || 3000, () => {
    
    console.log(" Server is listening on localhost:3000/ ");

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
           res.redirect(`/user_cards?username=${username}`);
        } else {
            // Username not found
            res.redirect(`/signup?invalidUsername=${username}`);            
        }
    });
});