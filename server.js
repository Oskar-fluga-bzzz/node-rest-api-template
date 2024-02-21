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
    database: "mydb",
  })
}

app.get("/", (req, res) => {
  res.send(`<h1>Doumentation</h1>
  <ul><li> GET /users</li></ul>`)
})

app.get("/users", async (req, res) => {
  let connection = await getDBConnnection()
  let sql = `SELECT * ...` //TODO: Skriv SQL här för att hämta alla users

  // Resultatet från .execute() är array med två arrayer
  // Den första innehåller resultatet från frågan.
  // Den andra innehåller fields, som är metadata om resultatet.
  // "let [results] ="" skapar variabeln results och tilldelar den värdet av den första arrayen.
  let [results] = await connection.execute(sql)
  console.log(results)

  //res.json() skickar resultat som JSON till klienten
  res.json(results)
})

/*
  app.post() hanterar en http request med POST-metoden.
*/
app.post("/users", function (req, res) {
  // Data som postats till routen ligger i body-attributet på request-objektet.
  console.log(req.body)

  // POST ska skapa något så här kommer det behövas en INSERT
  let sql = `INSERT INTO ...`
})

const port = 3000
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`)
})
