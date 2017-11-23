'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

// var word = require('./search');
var word = {
}

var sheetrock = require('sheetrock');


sheetrock({
  url: 'https://docs.google.com/spreadsheets/d/1kZPxVeYzRQQNFGjeIkZ7w_jZN1Cl2NgO3xBi5uIQYII/edit?usp=sharing#gid=0',
  query: "select B, D, E where C = 'وشبود'",
  callback: function (error, options, response) {
    // console.log(response.rows[1]);
    var word_list = response.rows[1];
    word.title = word_list.cellsArray[0]
    word.pronunciation = word_list.cellsArray[1]
    word.definition = word_list.cellsArray[2]
    console.log(word.title);
    console.log(word.pronunciation);
    console.log(word.definition);
  }
});


const app = express()

app.set('port', (process.env.PORT || 5000))

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get('/', function(req, res) {
  res.send('Hi I am a chatbot')
})

let token = "EAAFfncDwieMBAIzNr8GWU5pBKsOv1tDyUm8mZABiUoF2qOfWrutd6TmYud3bhokT5CpEFXq9bkMnABeBpzbwXZCLrcM2fVMuKjHvJ665BhiWjw7gSzGBj1TTWK0QgLAzZAAAgA792xrwrKa1kkZCCrwRZAito20LsOGa483hGHwZDZD"


app.get('/webhook/', function(req, res) {
  if (req.query['hub.verify_token'] === 'balochiwords') {
    res.send(req.query['hub.challenge'])
  }
  res.send("Wrong token")
})


app.post('/webhook/', function(req, res) {
  let messaging_events = req.body.entry[0].messaging
  for(let i = 0; i < messaging_events.length; i++) {
    let event = messaging_events[i]
    let sender = event.sender.id
    if(event.message && event.message.text ) {
      let text = event.message.text
      sendText(sender, "Text echo : \n" + text.substring(0, 100) + '\\n' + word.title + ' ' + word.definition)
    }
  }
  res.sendStatus(200)
})



// console.log(person1.fullName());

function sendText(sender, text) {
  let messageData = {text: text}
  request({
    url: "https://graph.facebook.com/v2.6/me/messages",
    qs: {access_token: token},
    method: "POST",
    json: {
      recipient: {id: sender},
      message: messageData
    }
  }, function(error, response, body) {
    if (error) {
      console.log("sending error");
    } else if (response.body.error) {
      console.log("response body error");
    }
  })
}

app.listen(app.get('port'), function() {
  console.log("running port");
})
