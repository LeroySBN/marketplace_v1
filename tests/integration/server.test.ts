import request from 'request';
import { expect } from 'chai';

describe('Integration test', () => {
  const SOURCE = 'http://0.0.0.0:8000';

  it('GET /status returns correct response', (done) => {
    request.get(`${SOURCE}/status`, (err, res, body) => {
      expect(res.statusCode).to.be.equal(200);
      expect(body).to.be.equal('{"redis":true,"mongodb":true}');
      done();
    });
  });

  it('GET /stats returns correct response', (done) => {
    request.get(`${SOURCE}/stats`, (err, res, body) => {
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });

  describe('VendorsController', () => {
    it('POST /vendors returns 400 for invalid attemps to add a new vendor with no email and password', (done) => {
      request.get(`${SOURCE}/vendors`, (err, res, body) => {
        expect(res.statusCode).to.be.equal(400);
        done();
      });
    });

    it('GET /vendors/me returns 401 for invalid cart ID', (done) => {
      request.get(`${SOURCE}/vendors/me`, (err, res, body) => {
        expect(res.statusCode).to.be.equal(401);
        expect(body).to.be.equal("{ error: 'Unauthorized' }");
        done();
      });
    });
  });

  describe('UsersController', () => {
    it('POST /users returns 400 for invalid attemps to add a new user with no email and password', (done) => {
      request.get(`${SOURCE}/users`, (err, res) => {
        expect(res.statusCode).to.be.equal(400);
        done();
      });
    });

    it('GET /users/me returns 404 for invalid cart ID', (done) => {
      request.get(`${SOURCE}/users/me`, (err, res, body) => {
        expect(res.statusCode).to.be.equal(401);
        expect(body).to.be.equal("{ error: 'Unauthorized' }");
        done();
      });
    });
  });

  describe('ProductsController', () => {
    it('GET /products returns status code of 200', (done) => {
      request.get(`${SOURCE}/products`, (err, res, body) => {
        expect(res.statusCode).to.be.equal(200);
        done();
      });
    });
  });
});
