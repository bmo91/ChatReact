const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const Chatkit = require('pusher-chatkit-server')

const app = express()

const chatkit = new Chatkit.default({
  instanceLocator: 'v1:us1:51b5421b-832b-4003-a1c5-411fb39025fc',
  key:
    'd17534ac-a237-4f2f-b667-3ffc34466173:LDF/bfXZxhWSDf/PZtKb7INun7N7pTmEOwT/RVdf1RQ=',
})

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

app.post('/users', (req, res) => {
  const { username } = req.body
  chatkit
    .createUser(username, username)
    .then(() => res.sendStatus(201))
    .catch(error => {
      if (error.error_type === 'services/chatkit/user/user_already_exists') {
        res.sendStatus(200)
      } else {
        res.status(error.statusCode).json(error)
      }
    })
})

app.post('/authenticate', (req, res) => {
  const { grant_type } = req.body
  res.json(chatkit.authenticate({ grant_type }, req.query.user_id))
})

const PORT = 3002
app.listen(PORT, err => {
  if (err) {
    console.error(err)
  } else {
    console.log(`Running on port ${PORT}`)
  }
})