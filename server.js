const express = require("express")
const app = express()
const mysql = require("mysql2/promise")

// parse application/json, för att hantera att man POSTar med JSON
const bodyParser = require("body-parser")

// Inställningar av servern.
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

async function getDBConnnection() {
  // Här skapas ett databaskopplings-objekt med inställningar för att ansluta till servern och databasen.
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "phpmyadmin",
  })
}

// GET request to fetch user data
app.get('/userdata', async function(req, res) {
  let connection = await getDBConnnection()
  let sql = `SELECT * FROM userdata`   
  let [results] = await connection.execute(sql)

  //res.json() skickar resultat som JSON till klienten
  res.json(results)
});

// POST request to add user data
app.post('/userdata', async function(req, res) {
  //req.body innehåller det postade datat
   console.log(req.body)
 
   let connection = await getDBConnnection();
   let sql = `INSERT INTO userdata (id, firstname, surname, userid, password) VALUES (?, ?)`
 
   let [results] = await connection.execute(sql, [
     req.body.username,
     req.body.name,
   ])
 
   //results innehåller metadata om vad som skapades i databasen
   console.log(results)
   res.json(results)
 });
 

app.get("/users", async function(req, res) {
  (res.send(`<h1>Doumentation</h1>
  <ul><li> GET /users</li></ul>
  <ul><li> GET /userdata</li></ul>`)
)
})

const port = 3000
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`)
})