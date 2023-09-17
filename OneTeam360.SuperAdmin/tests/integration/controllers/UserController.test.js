let supertest = require('supertest');
let sails = require('sails');
var token = '';

describe('UserController', () => {
  describe('#Login()', () => {
    it('Login User', (done) => {
      supertest(sails.hooks.http.app)
        .post('/login')
        .send({ email: 'zsoni@synoptek.com', password: 'Zarana@12' })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          token = res.body.data.token;
          return done();
        });
    });
  });
  describe('#forgotPassword()', () => {
    it('forgot password of user', (done) => {
      supertest(sails.hooks.http.app)
        .post('/forgot-password')
        .send({ email: 'mbhavsar@synoptek.com' })
        .expect('Content-type', /json/)
        .set('Authorization', token)
        .expect(200)
        .end((err) => {
          if (err) { return done(err); }
          done();
        });
    });
  });

  describe('#resetPassword()', () => {
    it('reset password of user', (done) => {
      supertest(sails.hooks.http.app)
        .post('/reset-password')
        .send({ password: 'Zarana@1234' })
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
        .send({ password: 'Zarana@1234', newpassword: 'Zarana@123' })
        .expect('Content-type', /json/)
        .set('Authorization', token)
        .expect(200)
        .end((err) => {
          if (err) { return done(err); }
          done();
        });
    });
  });
  describe('#add()', () => {
    it('Add User', (done) => {
      supertest(sails.hooks.http.app)
        .post('/user')
        .set('Authorization', token)
        .send({
          'first_name' : 'test',
          'last_name'  : 'script',
          'email'      : 'kajusoni@gmail.com',
          'status'     : 'Invited'
        })
        .expect('Content-type',/json/)
        .expect(200)
        .end((err) => {
          if(err)
          {
            return done(err);
          }
          return done();
        });
    });
  });

  describe('#find()', () => {
    it('Show all Users', (done) => {
      supertest(sails.hooks.http.app)
        .get('/user-list?first=1&rows=50&offset=0&perPage=50&sortField=user_id&sortOrder=DESC&filters=')
        .set('Authorization', token)
        .expect(200)
        .end((err) => {
          if (err) {return done(err);}
          return done();
        });
    });
  });

  describe('#findbyId()', () => {
    it('Find User By Id', (done) => {
      supertest(sails.hooks.http.app)
          .get('/user/'+ userId)
          .set('Authorization', token)
          .expect(200)
          .end((err) => {
            if (err) {return done(err);}
            return done();
          });
    });
  });

  describe('#edit()', () => {
    it('Edit User', (done) => {
      supertest(sails.hooks.http.app)
          .put('/user/' + userId)
          .set('Authorization', token)
          .send({
            'first_name' : 'test',
            'last_name'  : 'script1',
            'email'      : 'kajusoni@gmail.com',
            'status'     : 'Active'
          })
            .expect('Content-type',/json/)
            .expect(200)
            .end((err) => {
              if (err)
              {
                return done(err);
              }
              else{
                return done();
              }
            });
    });
  });

  describe('#delete()', () => {
    it('Delete User By Id', (done) => {
      supertest(sails.hooks.http.app)
          .delete('/user/' + userId)
          .set('Authorization', token)
          .expect(200)
          .end((err) => {
            if (err) {return done(err);}
            done();
          });
    });
  });

  describe('#activate()', () => {
    it('Activate/Inactivate User By Id', (done) => {
      supertest(sails.hooks.http.app)
          .get('/user/activate/' + userId)
          .set('Authorization', token)
          .expect(200)
          .end((err) => {
            if (err) {return done(err);}
            done();
          });
    });
  });
});
