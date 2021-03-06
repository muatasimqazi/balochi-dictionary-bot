'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

// var word = require('./search');
var word = {}
word.error = '';

var sheetrock = require('sheetrock');
var query = "select B, D, E where C = 'بلوچی'"

const app = express()

app.set('port', (process.env.PORT || 5000))

app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(bodyParser.json())

app.get('/', function(req, res) {
  res.send('Hi I am a chatbot')
})

let token = '';


app.get('/webhook/', function(req, res) {
  if (req.query['hub.verify_token'] === 'balochiwords') {
    res.send(req.query['hub.challenge'])
  }
  res.send("Wrong token")
})


app.post('/webhook/', function(req, res) {
  let messaging_events = req.body.entry[0].messaging
  for (let i = 0; i < messaging_events.length; i++) {
    let event = messaging_events[i]
    let sender = event.sender.id
    if (event.message && event.message.text) {
      let text = event.message.text
      let qu = "select B, D, E where C = '" + text + "'"

      // console.log(word);
      if(text.split(' ').length > 2) {
        var message = "Thank you for reaching out to us. We will get back to you soon."
        sendText(sender, message)
      } else {
        getData(qu, sender);
      }


    }
  }
  res.sendStatus(200)
})


var getData = function(qu, sender) {
  sheetrock({
    url: 'url',
    query: qu,
    reset: true,
    callback: function(error, options, response) {

      if (!error) {
        /*
          Parse response.data, loop through response.rows, or do something with
          response.html.
        */
        var word_display = '';
        var word_list = ''

        word_list = response.rows[1];

        word.title = word_list.cellsArray[0]
        word.pronunciation = word_list.cellsArray[1]
        word.definition = word_list.cellsArray[2]
        word_display = '*' + word.title + '*\n' + '(`' + word.pronunciation + '`)' + '\n' + word.definition + '\n\n\n' // + JSON.stringify(response.rows)

        if (response.rows[2]) {
          word_list = response.rows[2];

          word.title = word_list.cellsArray[0]
          word.pronunciation = word_list.cellsArray[1]
          word.definition = word_list.cellsArray[2]
          word_display += '*' + word.title + '*\n' + '(`' + word.pronunciation + '`)' + '\n' + word.definition + '\n\n\n' // + JSON.stringify(response.rows)

        }
        if (response.rows[3]) {
          word_list = response.rows[3];

          word.title = word_list.cellsArray[0]
          word.pronunciation = word_list.cellsArray[1]
          word.definition = word_list.cellsArray[2]
          word_display += '*' + word.title + '*\n' + '(`' + word.pronunciation + '`)' + '\n' + word.definition + '\n\n\n' // + JSON.stringify(response.rows)

        }
        if (response.rows[4]) {
          word_list = response.rows[4];

          word.title = word_list.cellsArray[0]
          word.pronunciation = word_list.cellsArray[1]
          word.definition = word_list.cellsArray[2]
          word_display += '*' + word.title + '*\n' + '(`' + word.pronunciation + '`)' + '\n' + word.definition + '\n\n\n' // + JSON.stringify(response.rows)

        }
        if (response.rows[5]) {
          word_list = response.rows[5];

          word.title = word_list.cellsArray[0]
          word.pronunciation = word_list.cellsArray[1]
          word.definition = word_list.cellsArray[2]
          word_display += '*' + word.title + '*\n' + '(`' + word.pronunciation + '`)' + '\n' + word.definition + '\n\n\n' // + JSON.stringify(response.rows)

        }
        if (response.rows[6]) {
          word_list = response.rows[6];

          word.title = word_list.cellsArray[0]
          word.pronunciation = word_list.cellsArray[1]
          word.definition = word_list.cellsArray[2]
          word_display += '*' + word.title + '*\n' + '(`' + word.pronunciation + '`)' + '\n' + word.definition + '\n\n\n' // + JSON.stringify(response.rows)

        }
        sendText(sender, word_display)

      } else {
        word.error = "Word not found! \n\nFor accurate results, please type the word without any diacritic mark(s) or زَبر، زِیر، پیش etc.\n\n\nIf you intend to send us a message, please write us a message that is longer than two words. We will get back to you shortly."

        sendText(sender, word.error)
        console.log(error, options, response);
      }
    }
  });
}


function sendText(sender, text) {
  let messageData = {
    text: text
  }
  request({
    url: "https://graph.facebook.com/v2.6/me/messages",
    qs: {
      access_token: token
    },
    method: "POST",
    json: {
      recipient: {
        id: sender
      },
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
