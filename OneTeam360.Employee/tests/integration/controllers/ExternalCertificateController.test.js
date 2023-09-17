const supertest = require('supertest');
const sails = require('sails');
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mywicm9sZSI6ImFkbWluIiwiaXNMb2dnZWRJbiI6dHJ1ZSwiaWF0IjoxNjIxODM2OTcxLCJleHAiOjE2MjE5MjMzNzF9._yUE8FnG7Ss7gqXcjP6XNOWXUNidihdtv0K_E3fpiOM';
const ecertificateId = 0;

describe('ExternalCertificateController', () => {
  describe('#add()', () => {
    it('Add ExternalCertificate', (done) => {
      supertest(sails.hooks.http.app)
        .post('/externalCertificate')
        .set('Authorization', token)
        .send({
          'certification' : 'Second Aid',
          'start_date'    : '04/15/2021',
          'end_date'      : '04/30/2021',
          'note'          : 'Lorem Ipsum Lorem Ipsum Lorem Ipsum',
          'employee_id'   : '44'
        })
          .expect('Content-type',/json/)
          .expect(200)
          .end((err) => {
            if (err) {return done(err);}
            done();
          });
    });
  });

  describe('#find()', () => {
    it('Show all external certificate', (done) => {
      supertest(sails.hooks.http.app)
        .get('/externalCertificate')
        .set('Authorization', token)
        .expect(200)
        .end((err) => {
          if (err) {return done(err);}
          done();
        });
    });
  });

  describe('#findbyId()', () => {
    it('Find external certificate By Id', (done) => {
      supertest(sails.hooks.http.app)
        .get('/externalCertificate/' + ecertificateId)
        .set('Authorization', token)
        .expect(200)
        .end((err) => {
          if (err) {return done(err);}
          done();
        });
    });
  });

  describe('#delete()', () => {
    it('Delete external certificate By Id', (done) => {
      supertest(sails.hooks.http.app)
        .delete('/externalCertificate/' + ecertificateId)
        .set('Authorization', token)
        .expect(200)
        .end((err) => {
          if (err) {return done(err);}
          done();
        });
    });
  });

  describe('#edit()', () => {
    it('Edit external certificate', (done) => {
      supertest(sails.hooks.http.app)
        .put('/externalCertificate/' + ecertificateId)
        .set('Authorization', token)
        .send({
          'certification' : 'Second Aid test',
          'start_date'    : '04/15/2021',
          'end_date'      : '04/30/2021',
          'note'          : 'Lorem Ipsum Lorem Ipsum Lorem Ipsum',
        })
          .expect('Content-type',/json/)
          .expect(200)
          .end((err) => {
            if (err) {return done(err);}
            done();
          });
    });
  });

});
