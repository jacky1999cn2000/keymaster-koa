'use strict';

var AWS = require('aws-sdk-promise');
var config;

if(process.argv.indexOf("--prod") != -1){
  config = require('../config/production.js');
}else{
  config = require('../config/development.js');
}

AWS.config.update({
  region: config.aws.region,
  endpoint: config.aws.endpoint,
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey
});

var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();

module.exports = {
  query: function(params) {
    return docClient.query(params).promise();
  },

  put: function(params){
    return docClient.put(params).promise();
  },

  destroy: function(params){
    return docClient.delete(params).promise();
  }
}
