var express = require('express');
const validate = require('express-validation');
const axios = require('axios');
const bodyParser = require('body-parser');

const {
  listRequests,
} = require('./request.validation');

const subscriptions = {
  "BASIC": 10,
  "PRO": 250,
  "ULTRA": 1000
}

var app = express();
app.use(bodyParser.json());

//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async function (req, res) {
  console.log("GET /")
  res.send({});
})
app.post('/syncRequests', validate(listRequests), async function (req, res, next) {
  console.log("POST /syncRequests")
  console.log(req.headers);
  const subscription = req.header('x-rapidapi-subscription');
  if (!subscription) {
    next(new Error("Subscription Header Not Found"))
  }
  const maxConccrency = subscriptions[subscription];
  if (req.body.requests.length >= maxConccrency) {
    next(new Error("Max Concurrency Exceeded"))
  }
  const response = await Promise.all(req.body.requests.map((request) => {
    return axios.request(request);
  }))
  res.send({ response: response.map(e => ({ body: e.data, headers: e.headers })) })
})

app.use(function (err, req, res, next) {
  if (err instanceof validate.ValidationError) {
    return res.status(err.status).json(err)
  }
  console.log(err)
  if ((err.message.localeCompare("Max Concurrency Exceeded") == 0) || (err.message.localeCompare("Subscription header Not Found") == 0)) {
    return res.status(500).json({ status: 501, message: err.message })
  }
  return res.status(500).json(err)
})


var server = app.listen(8081, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("Example app listening at http://%s:%s", host, port)
})
