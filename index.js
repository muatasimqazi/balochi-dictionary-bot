'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')


var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

// var word = require('./search');

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




// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';

// Load client secrets from a local file.
fs.readFile('client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  // Authorize a client with the loaded credentials, then call the
  // Google Sheets API.
  authorize(JSON.parse(content), listMajors);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

var word = {};
/**
 * Print the names and majors of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 */
function listMajors(auth) {
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
    auth: auth,
    spreadsheetId: '1kZPxVeYzRQQNFGjeIkZ7w_jZN1Cl2NgO3xBi5uIQYII',
    range: 'Sheet1!C3:D',
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var rows = response.values;
    if (rows.length == 0) {
      console.log('No data found.');
    } else {
    var numRows = response.values ? response.values.length : 0;
    console.log('%d rows retrieved.', numRows);

    // console.log(words.length);
    var lookup = 'آبرچ';
    // console.log(word[300][0]);
    for(var i = 0; i < rows.length; i++) {
        if(rows[i][0] === lookup) {
          word.title = rows[i][0];
          word.definition = rows[i][1];
          console.log(rows[i][0]);
          console.log(rows[i][1]);
          console.log(word.title);
        }
    }
  }
  });
}
//

app.post('/webhook/', function(req, res) {
  let messaging_events = req.body.entry[0].messaging
  for(let i = 0; i < messaging_events.length; i++) {
    let event = messaging_events[i]
    let sender = event.sender.id
    if(event.message && event.message.text ) {
      let text = event.message.text
      sendText(sender, "Text echo : " + text.substring(0, 100) + ' ' + word.title + ' ' + word.definition)
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
