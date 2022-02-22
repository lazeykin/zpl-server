import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'
import https from 'https'
import fs from 'fs'
import * as dotenv from 'dotenv';

const app = express();
dotenv.config();
app.use(cors());
app.use(express.json({ type: '*/*' }));

app.get('/default', (req, res) => {
  console.log('GET request for /default recieved')
  res.json({
    "deviceType": "printer",
    "uid": "Zebra ZP 500 (ZPL)",
    "provider": "com.zebra.ds.webdriver.desktop.provider.DefaultDeviceProvider",
    "name": "Zebra ZP 500 (ZPL)",
    "connection": "driver",
    "version": 3,
    "manufacturer": "Zebra Technologies"
  })
})

app.get('/available', (req, res) => {
  console.log('GET request for /available recieved')
  res.json({
    "deviceList": [
      {
        "uid": "Zebra ZP 500 (ZPL)",
        "name": "Zebra ZP 500 (ZPL)"
      }
    ]
  })
})

app.post('/read', (req, res) => {
  console.log('POST request for /read recieved')
  res.status(200).send();
})

app.post('/write', (req, res) => {
  console.log('POST request for /write recieved')
  console.log('data:', (req && req.body) ? req.body.data : '"data" missing req.body');
  console.log('---------------------------------------\n')
  if (process.env.CHROME_EXTENSION_ENABLED === String(true)) {
    const port = process.env.CHROME_EXTENSION_PORT ?? '9102';
    // const payload = typeof req.body.data === 'string' ? req.body.data : Buffer.from(req.body.data);
    fetch(`http://localhost:${port}`, { method: 'POST', body: '{"mode":"print","epl":"' + Buffer.from(req.body.data) + '"}' })
      .catch((e) => {
        // do nothing, keep the console clean
      });
    }
  res.json({})
})

const SERVER_PORT = 9100;
const SERVER_PORT_SSL = 9101;
const EXTENSION_PORT = process.env.CHROME_EXTENSION_PORT ?? '9101';

//SSL key and cert
var option = {
  key: fs.readFileSync('ssl/server.key'),
  cert: fs.readFileSync('ssl/server.cert')
};


https.createServer(option, app).listen(SERVER_PORT_SSL, () => {
  console.log(`\nBrowser Print Fake Server running on https://localhost:${SERVER_PORT}\n\n`)
  console.log('******************************************************************************')
  if (process.env.CHROME_EXTENSION_ENABLED === String(true)) {
    console.log(
      '  TIP: If you want to preview the label you can install the Zpl Printer\n  extension from the chrome web store and set it up to listen on port ' + EXTENSION_PORT
    )
  } else { 
    console.log('Chrome extension support not enabled.');
  }
  console.log('******************************************************************************\n')
});


app.listen(SERVER_PORT,'127.0.0.1', () => {
  console.log(`\nBrowser Print Fake Server running on http://localhost:${SERVER_PORT}\n\n`)
  console.log('******************************************************************************')
  if (process.env.CHROME_EXTENSION_ENABLED === String(true)) {
    console.log(
      '  TIP: If you want to preview the label you can install the Zpl Printer\n  extension from the chrome web store and set it up to listen on port ' + EXTENSION_PORT
    )
  } else {
    console.log('Chrome extension support not enabled.');
  }
  console.log('******************************************************************************\n')
});
