'use strict';

const express = require('express');
const path = require('path');
const routes = require('./routes');

const app = express();

// Parse JSON bodies
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..', 'public')));

// API routes
app.use(routes);

module.exports = app;
