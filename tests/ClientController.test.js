'use strict';

var app = require('../app.js');
var AWS = require('../services/AWS.js');
var chai = require('chai'),
    sinon = require('sinon'),
    should = chai.should(),
    request = require('supertest').agent(app.listen());

describe('ClientController', function() {

  describe('#getClient', function(){

    afterEach(function(){
      AWS.query.restore();
    });

    it('should return 200 with an empty object if AWS.query() didn\'t find any matched items', function(done){
      sinon.stub(AWS, 'query', function(){
        let response = {
          data: {
            Items: []
          }
        }
        return response;
      });
      request
          .get('/client/dummyid')
          .expect(function(res) {
            res.body.should.be.empty;
          })
          .expect(200, done);
    });

    it('should return 200 with an object if AWS.query() found a matched one', function(done){
      sinon.stub(AWS, 'query', function(){
        let response = {
          data: {
            Items: [{
              "client_id": "dummyid",
              "client_secret": "dummysecret",
              "redirect_uri": "https://dummyuri.com",
              "api_key": "dummykey",
              "created_by": "dummy"
            }]
          }
        }
        return response;
      });
      request
          .get('/client/dummyid')
          .expect(function(res) {
            res.body.should.deep.equal({
              "client_id": "dummyid",
              "client_secret": "dummysecret",
              "redirect_uri": "https://dummyuri.com",
              "api_key": "dummykey",
              "created_by": "dummy"
            });
          })
          .expect(200, done);
    });

    it('should return 400 with an error message if AWS.query() throws error', function(done){
      sinon.stub(AWS, 'query', function(){
        throw Error('something went wrong!')
      });
      request
          .get('/client/dummyid')
          .expect(function(res) {
            res.body.message.should.equal('something went wrong!');
          })
          .expect(400, done);
    });
  });

  describe('#createClient', function(){
    let body = {
      "client_id": "dummyid",
      "client_secret": "dummysecret",
      "redirect_uri": "https://dummyuri.com",
      "api_key": "dummykey",
      "created_by": "dummy"
    };

    afterEach(function(){
      AWS.put.restore();
    });

    it('should return 200 with the passed in object if AWS.put() executed successully', function(done){
      sinon.stub(AWS, 'put', function(){
        let response = {}
        return response;
      });
      request
          .post('/client/')
          .send(body)
          .expect(function(res) {
            res.body.should.deep.equal({
              "client_id": "dummyid",
              "client_secret": "dummysecret",
              "redirect_uri": "https://dummyuri.com",
              "api_key": "dummykey",
              "created_by": "dummy"
            });
          })
          .expect(200, done);
    });

    it('should return 400 with an error message if AWS.put() throws error', function(done){
      sinon.stub(AWS, 'put', function(){
        throw Error('something went wrong!')
      });
      request
          .post('/client/')
          .send(body)
          .expect(function(res) {
            res.body.message.should.equal('something went wrong!');
          })
          .expect(400, done);
    });
  });

  describe('#destroyClient', function(){

    afterEach(function(){
      AWS.destroy.restore();
    });

    it('should return 200 with client_id of the deleted object if AWS.destroy() executed successully', function(done){
      sinon.stub(AWS, 'destroy', function(){
        let response = {}
        return response;
      });
      request
          .delete('/client/dummyid')
          .expect(function(res) {
            res.body.should.deep.equal({
              "client_id": "dummyid"
            });
          })
          .expect(200, done);
    });

    it('should return 400 with an error message if AWS.destroy() throws error', function(done){
      sinon.stub(AWS, 'destroy', function(){
        throw Error('something went wrong!')
      });
      request
          .delete('/client/dummyid')
          .expect(function(res) {
            res.body.message.should.equal('something went wrong!');
          })
          .expect(400, done);
    });
  });

});
