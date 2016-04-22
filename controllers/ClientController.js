'use strict';

var AWS = require('../services/AWS.js');
var parse = require('co-body');

module.exports = {
  getClient: function* (id){
    let params = {
        TableName : 'Client',
        KeyConditionExpression: "client_id = :cid",
        ExpressionAttributeValues: {
            ":cid":id
        }
    };
    try{
      let response = yield AWS.query(params);
      let client = response.data.Items[0] || {};
      this.body = client;
      this.status = 200;
    }catch(ex){
      let error = {
        message: ex.message,
        code: ex.code
      }
      this.body = error;
      this.status = 400;
    }
  },

  createClient: function* (){
    let item = yield parse(this);
    let params = {
        TableName: 'Client',
        Item: item
    };
    try{
      let response = yield AWS.put(params);
      this.body = item;
      this.status = 200;
    }catch(ex){
      let error = {
        message: ex.message,
        code: ex.code
      }
      this.body = error;
      this.status = 400;
    }
  },

  destroyClient: function* (id){
    let params = {
        TableName : 'Client',
        Key:{
          'client_id':id
        }
    };
    try{
      yield AWS.destroy(params);
      this.body = {client_id:id};
      this.status = 200;
    }catch(ex){
      let error = {
        message: ex.message,
        code: ex.code
      }
      this.body = error;
      this.status = 400;
    }
  }
};
