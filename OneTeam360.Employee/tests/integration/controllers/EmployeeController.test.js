/* eslint-disable camelcase */
/* eslint-disable no-console */
/* eslint-disable no-trailing-spaces */
const supertest = require('supertest');
const sails = require('sails');
process.env.JWT_SECRET_KEY='123456546465';
process.env.EMAIL_USERNAME='jtrivedi@synoptek.com';
let userId = 33;
let token = '';
let profile_picture = '';

describe('EmployeeController', () => {

  describe('#Login()', () => {
    it('Login User', (done) => {
      supertest('http://localhost:8080/authentication')
      .post('/login')
      .send({ email: 'testfgtr@gmail.com', password: 'anjali1234' })
      .end((err, res) => {
        if(err) 
        {
          return done(err);
        }
        token = res.body.data.token;
        let tenantId = res.body.data.AccountList[0].tenantId;
        sails.log(tenantId);
        return done();
      });
    });
  });

  describe('#Select-Tenant()', () => {
    it('Select Tenant', (done) => {
      supertest('http://localhost:8080/authentication')
            .post('/select-tenant')
            .send({tenantId: tenantId})
            .set('Authorization', token)
            .expect('Content-type',/json/)
            .end((err, res) => {
              if (err) {return done(err);}
              token = res.body.data.token;
              done();
            });
    });
  });

  describe('#Image-Upload()', () => {
    it('Image Upload', (done) => {
      supertest(sails.hooks.http.app)
        .post('/imageUpload')
        .set('Content-type','multipart/form-data')
        .attach('image', './assets/images/50ebf669-c47c-46df-af74-8befb88e95d5.png')
        .set('Authorization', token)
        .end((err, res) => {
          if (err) {return done(err);}
          profile_picture = res.body.data.imageName;
          done();
        });
    });
  });

  describe('#add()', () => {
    it('Add User', (done) => {
      supertest(sails.hooks.http.app)
        .post('/employee')
        .set('Authorization', token)
        .send({
          'username'                   : 'jianatrivedi',
          'first_name'                 : 'jiana',
          'last_name'                  : 'trivedi',
          'middle_name'                : 'd',
          'address'                    : 'ahmedabad gujarat',
          'email'                      : 'guptaanj1504@gmail.com',
          'date_of_birth'              : '1998-04-15',
          'date_of_joining'            : '2021-05-21',
          'emergency_contact_name'     : 'test',
          'emergency_contact_relation' : 'frd',
          'emergency_number'           : '12354689',
          'emergency_address'          : 'gujarat',
          'profile_picture'            : profile_picture,
          'role_id'                    : 1,
          'location_id'                : [1],
          'points'                     : 56,
          'status'                     : 1,
          'level_id'                   : 1
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
        .get('/employee?first=1&rows=10&sortField=&sortOrder=&filters=eyJmaXJzdF9uYW1lIjp7Im1hdGNoTW9kZSI6InN0YXJ0c1dpdGgiLCJ2YWx1ZSI6ImFuamFsaSJ9fQ==')
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
          .get('/employee/'+ userId)
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
          .put('/employee/' + userId)
          .set('Authorization', token)
          .send({
            'username'                   : 'anjali',
            'first_name'                 : 'anjali',
            'last_name'                  : 'gupta',
            'middle_name'                : 'sanjay',
            'address'                    : 'ahmedabad gujarat',
            'email'                      : 'testfgtr@gmail.com',
            'date_of_birth'              : '1999-04-15',
            'date_of_joining'            : '2021-04-21',
            'emergency_contact_name'     : 'test',
            'emergency_contact_relation' : 'test',
            'emergency_number'           : 'test',
            'emergency_address'          : 'test',
            'profile_picture'            : profile_picture,
            'role_id'                    : 1,
            'location_id'                : [1],
            'points'                     : 563,
            'status'                     : 1,
            'level_id'                   : 1
          })
            .expect('Content-type',/json/)
            .expect(200)
            .end((err) => {
              if (err) {return done(err);}
              return done();
            });
    });
  });

  describe('#delete()', () => {
    it('Delete User By Id', (done) => {
      supertest(sails.hooks.http.app)
          .delete('/employee/' + userId)
          .set('Authorization', token)
          .expect(200)
          .end((err) => {
            if (err) {return done(err);}
            done();
          });
    });
  });

  describe('#find()', () => {
    it('Find Location', (done) => {
      supertest(sails.hooks.http.app)
          .get('/location')
          .set('Authorization', token)
          .expect(200)
          .end((err) => {
            if (err) {return done(err);}
            return done();
          });
    });
  });

  describe('#find()', () => {
    it('Find Role', (done) => {
      supertest(sails.hooks.http.app)
          .get('/role')
          .set('Authorization', token)
          .expect(200)
          .end((err) => {
            if (err) {return done(err);}
            return done();
          });
    });
  });

  describe('#find()', () => {
    it('Find Level', (done) => {
      supertest(sails.hooks.http.app)
          .get('/level')
          .set('Authorization', token)
          .expect(200)
          .end((err) => {
            if (err) {return done(err);}
            return done();
          });
    });
  });

});
