require("dotenv").config()
const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const Person = require("./models/person")

// server setup
const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static("build"))

morgan.token("body", (req, res) => {
  return JSON.stringify(req.body)
})
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :body", {stream: process.stdout}))

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

app.get("/", (req, res) => {
  res.send("<h1>Hello World</h1>")
})

app.get("/info", (req, res) => {
  const returnString = `
    <h1>Phonebook has info for ${persons.length} people</h1><br/>
    <h1>${new Date().toLocaleString()}</h1>
  `
  res.send(returnString)
})

app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons)
  })
})

app.get("/api/persons/:id", (req, res) => {
  Person.findById(req.params.id).then((person) => {
    res.json(person)
  })
})

app.post("/api/persons", (req, res) => {
  const body = req.body
  if (!body.name || !body.number) {
    return res.status(400).json({
      error: "the name or number is missing"
    })
  } else {
    const person = new Person({
      name: body.name,
      number: body.number,
    })
    person.save().then((savedPerson) => {
      res.json(savedPerson)
    })
  }
})

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter((person) => (person.id !== id))
  res.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
