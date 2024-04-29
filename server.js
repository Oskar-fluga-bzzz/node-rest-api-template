const express = require("express")
const app = express()
const mysql = require("mysql2/promise")

const bodyParser = require("body-parser")

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
  let [results] = await connection.execute(sql)

  res.json(results)
});

// POST
app.post('/userdata', async function(req, res) {
  
  if (isValidUserData(req.body)) {
    console.log(req.body)
 
    let connection = await getDBConnnection()
    let sql = `INSERT INTO userdata (firstname, surname, userid, password) VALUES (?, ?, ?, ?)`
  
    let [results] = await connection.execute(sql, [
      req.body.firstname,
      req.body.surname,
      req.body.userid,
      req.body.password
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

  let [results] = await connection.execute(sql, [
    req.body.firstname,
    req.body.surname,
    req.body.userid,
    req.body.password,
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


//dokumentation
app.get("/doc", async function(req, res) {
  (res.send(`<h1>Documentation</h1>
  <ul><li> GET /doc</li></ul>
  <ul><li> GET /userdata</li></ul>
  <ul><li> GET /userdata/:id</li></ul>
  <ul><li> POST /userdata -  lägger till användare, accepterar följande JSON format: {
    "firstname": "Förnamn",
    "surname": "Efternamn",
    "userid": "AnvändarID",
    "password": "EttFintJävlaLösenord"
  }</li></ul>`))
})

const port = 3000
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`)
})