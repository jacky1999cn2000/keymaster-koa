'use strict';

var koa = require('koa');
var app = module.exports = koa();
var routes = require('koa-route');

var clientController = require('./controllers/ClientController');
app.use(routes.get('/client/:id', clientController.getClient));
app.use(routes.post('/client/', clientController.createClient));
app.use(routes.delete('/client/:id', clientController.destroyClient));

app.listen(3000);
console.log('The app is listening at port 3000');
