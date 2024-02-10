const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const contactManager = require('./lib/contact_manager');
const helpers = require('./lib/helpers');

const app = express();

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.options('*', (req, res) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization', // Add other headers here as needed
  });
  res.status(200).end();
});


app.get('/api/contacts', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.json(contactManager.getAll());
});

app.get('/api/contacts/:id', (req, res) => {
  let contact = contactManager.get(req.params['id']);
  res.set('Access-Control-Allow-Origin', '*');
  if (contact) {
    res.json(contact);
  } else {
    res.status(404).end();
  }
});

app.post('/api/contacts', (req, res) => {
  let contactAttrs = helpers.extractContactAttrs(req.body);
  let contact = contactManager.add(contactAttrs);
  res.set('Access-Control-Allow-Origin', '*');
  if (contact) {
    res.status(201).json(contact);
  } else {
    res.status(400).end();
  }
});

app.put('/api/contacts/:id', (req, res) => {
  let contactAttrs = helpers.extractContactAttrs(req.body);
  let contact = contactManager.update(req.params['id'], contactAttrs);
  res.set('Access-Control-Allow-Origin', '*');
  if (contact) {
    res.status(201).json(contact);
  } else {
    res.status(400).end();
  }
});

app.delete('/api/contacts/:id', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (contactManager.remove(req.params['id'])) {
    res.status(204).end();
  } else {
    res.status(400).end();
  }
});

app.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});

module.exports = app; // for testing
