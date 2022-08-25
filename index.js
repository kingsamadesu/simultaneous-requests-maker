var express = require('express');
const validate = require('express-validation');
const axios = require('axios');
const bodyParser = require('body-parser');

const {
  listRequests,
} = require('./request.validation');

var app = express();
app.use(bodyParser.json());

//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async function (req, res) {
  console.log("GET /")
  res.send({});
})
app.post('/syncRequests', validate(listRequests), async function (req, res) {
  console.log("POST /syncRequests")
  const response = await Promise.all(req.body.requests.map((request) => {
    return axios.request(request);
  }))
  res.send({ response: response.map(e => ({ body: e.data, headers: e.headers })) })
})

app.use(function (err, req, res, next) {
  if (err instanceof validate.ValidationError) {
    return res.status(err.status).json(err)
  }
  return res.status(500).json(err)
})


var server = app.listen(8081, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("Example app listening at http://%s:%s", host, port)
})
