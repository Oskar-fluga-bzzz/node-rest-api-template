const express = require("express")
const app = express()
const mysql = require("mysql2/promise")
const bcrypt = require("bcrypt");

const bodyParser = require("body-parser")
const jwt = require("jsonwebtoken")

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

async function getDBConnnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "phpmyadmin",
  })
}

// GET
app.get('/userdata', async function(req, res) {
  let connection = await getDBConnnection()
  let sql = `SELECT * FROM userdata`  
  
  let authHeader = req.headers['authorization']
if (authHeader === undefined) {
  console.log("400: Invalid Token")
}
let token = authHeader.slice(7)

let decoded
try {
  decoded = jwt.verify(token, 'en hemlig hemlighet som ingen kan gissa')
} catch (err) {
  console.log(err)
  res.status(401).send('401: Invalid auth token')
}

  let [results] = await connection.execute(sql)

  res.json(results)
});


// POST
app.post('/userdata', async function(req, res) {
  
  if (isValidUserData(req.body)) {
    console.log(req.body)
 
    let connection = await getDBConnnection()
    let sql = `INSERT INTO userdata (firstname, surname, userid, password) VALUES (?, ?, ?, ?)`

    let authHeader = req.headers['authorization']
    if (authHeader === undefined) {
      console.log("400: Invalid Token")
    }
    let token = authHeader.slice(7)
    
    let decoded
    try {
      decoded = jwt.verify(token, 'en hemlig hemlighet som ingen kan gissa')
    } catch (err) {
      console.log(err)
      res.status(401).send('401: Invalid auth token')
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
  
    let [results] = await connection.execute(sql, [
      req.body.firstname,
      req.body.surname,
      req.body.userid,
      hashedPassword
    ])
  
    console.log(results)
    res.json(results)
  } else {
    res.sendStatus(422)
  }

  function isValidUserData(body) {
    return body && body.firstname && body.surname && body.userid && body.password
  }  

 });

 // PUT
 app.put("/userdata/:id", async function (req, res) {
  let connection = await getDBConnnection()
  let sql = `UPDATE userdata
    SET firstname = ?, surname = ?, userid = ?, password = ?
    WHERE id = ?`

    let authHeader = req.headers['authorization']
    if (authHeader === undefined) {
      console.log("400: Invalid Token")
    }
    let token = authHeader.slice(7)
    
    let decoded
    try {
      decoded = jwt.verify(token, 'en hemlig hemlighet som ingen kan gissa')
    } catch (err) {
      console.log(err)
      res.status(401).send('401: Invalid auth token')
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

  let [results] = await connection.execute(sql, [
    req.body.firstname,
    req.body.surname,
    req.body.userid,
    hashedPassword,
    req.params.id
  ])
  console.log(results)
})

//GET userdata efter id
 app.get('/userdata/:id', async function(req, res) {
  try {
    let connection = await getDBConnnection()
    let sql = "SELECT * FROM userdata WHERE id = ?"
    let [results] = await connection.execute(sql, [req.params.id])

    let authHeader = req.headers['authorization']
    if (authHeader === undefined) {
      console.log("400: Invalid Token")
    }
    let token = authHeader.slice(7)
    
    let decoded
    try {
      decoded = jwt.verify(token, 'en hemlig hemlighet som ingen kan gissa')
    } catch (err) {
      console.log(err)
      res.status(401).send('401: Invalid auth token')
    }

    if (results.length > 0) {
      res.json(results[0])
    } else {
      console.log(results.length)
      res.status(404).json({ error: "User not found" })
    }
  } catch (error) {
    console.error("Error fetching user data:", error)
    res.status(500).json({ error: "Internal server error" })
  }
});

//login
app.post('/login', async function(req, res) {
  let connection = await getDBConnnection()
  try {
    let sql = "SELECT * FROM userdata WHERE userid = ?";
    let [results] = await connection.execute(sql, [req.body.userid]);

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = results[0];
    const hashedPasswordFromDB = user.password;

    const isPasswordValid = await bcrypt.compare(req.body.password, hashedPasswordFromDB);

    if (isPasswordValid) {
      let payload = {
        sub: req.body.id,
        name: req.body.firstname + req.body.lastname
      }
      let token = jwt.sign(payload, 'en hemlig hemlighet som ingen kan gissa')
      res.json({
        token
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//dokumentation
app.get("/doc", async function(req, res) {
  (res.send(`<h1>Documentation</h1>
  <ul><li> GET /doc</li></ul>
  <ul><li> GET /userdata (kräver token)</li></ul>
  <ul><li> GET /userdata/:id (kräver token)</li></ul>
  <ul><li> POST /userdata (kräver token) -  lägger till användare, accepterar följande JSON format: {
    "firstname": "Förnamn",
    "surname": "Efternamn",
    "userid": "Användarnamn",
    "password": "EttFintJävlaLösenord"
  }</li></ul>
  <ul><li> PUT /userdata/:id (kräver token) - ersätter användardata, samma format som POST</li></ul>
  <ul><li> LOGIN /login - logga in, accepterar följande JSON format:
  {
    "userid": "Användarnamn",
    "Password" "Lösenord"
  }
  </li></ul>`))
})

const port = 3000
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`)
})