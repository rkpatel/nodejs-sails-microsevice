let supertest = require('supertest');
let sails = require('sails');
let token = '';

describe('UserController', () => {
  describe('#Login()', () => {
    it('Login User', (done) => {
      supertest(sails.hooks.http.app)
        .post('/login')
        .send({ email: 'anikam@synoptek.com', password: 'anjali1234' })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          token = res.body.data.token;
          return done();
        });
    });
  });

  describe('#Select-Tenant()', () => {
    it('Select Tenant', (done) => {
      supertest(sails.hooks.http.app)
        .post('/select-tenant')
        .send({ tenantId: 5 })
        .set('Authorization', token)
        .expect('Content-type', /json/)
        .end((err, res) => {
          if (err) { return done(err); }
          else{
            token = res.body.data.token;
            return done();
          }
        });
    });
  });

  describe('#forgotPassword()', () => {
    it('forgot password of user', (done) => {
      supertest(sails.hooks.http.app)
        .post('/forgot-password')
        .send({ email: 'anikam@synoptek.com' })
        .expect('Content-type', /json/)
        .set('Authorization', token)
        .expect(200)
        .end((err, res) => {
          if (err) { return done(err); }
          else{ sails.log(res);}
          done();
        });
    });
  });

  describe('#resetPassword()', () => {
    it('reset password of user', (done) => {
      supertest(sails.hooks.http.app)
        .post('/reset-password')
        .send({ password: 'anjali123456' })
        .expect('Content-type', /json/)
        .set('Authorization', token)
        .expect(200)
        .end((err) => {
          if (err) { return done(err); }
          done();
        });
    });
  });

  describe('#changePassword()', () => {
    it('change password of user', (done) => {
      supertest(sails.hooks.http.app)
        .post('/change-password')
        .send({ password: 'anjali123456', newpassword: 'anjali12345' })
        .expect('Content-type', /json/)
        .set('Authorization', token)
        .expect(200)
        .end((err) => {
          if (err) { return done(err); }
          done();
        });
    });
  });
});
