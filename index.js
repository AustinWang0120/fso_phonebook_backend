require("dotenv").config()
const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const Person = require("./models/person")

// server setup
const app = express()

app.use(express.static("build"))
app.use(express.json())
app.use(cors())

// request logger
morgan.token("body", (req, res) => {
  return JSON.stringify(req.body)
})
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :body", { stream: process.stdout }))

// routers
app.get("/", (req, res) => {
  res.send("<h1>Hello World</h1>")
})

app.get("/info", (req, res) => {
  Person.countDocuments({})
    .then((count) => {
      const returnString = `
        <h1>Phonebook has info for ${count} people</h1><br/>
        <h1>${new Date().toLocaleString()}</h1>
      `
      res.send(returnString)
    })
})

app.get("/api/persons", (req, res, next) => {
  Person.find({}).then((persons) => {
    res.json(persons)
  }).catch((error) => (next(error)))
})

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id).then((person) => {
    res.json(person)
  }).catch((error) => (next(error)))
})

app.post("/api/persons", (req, res, next) => {
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
    }).catch((error) => (next(error)))
  }
})

app.put("/api/persons/:id", (req, res, next) => {
  const body = req.body
  const newPerson = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(req.params.id, newPerson, { new: true })
    .then((updatedPerson) => {
      res.json(updatedPerson)
    })
    .catch((error) => (next(error)))
})

app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then((removedPerson) => {
      res.status(204).end()
    })
    .catch((error) => (next(error)))
})

const unknownEndpoint = (req, res, next) => {
  res.status(404).send({
    error: "unknown endpoint"
  })

  next()
}
app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  return res.status(400).json({
    error: error.message
  })
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
