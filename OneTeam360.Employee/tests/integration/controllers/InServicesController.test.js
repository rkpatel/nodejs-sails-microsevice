const supertest = require('supertest');
const sails = require('sails');
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIsInJvbGUiOiJhZG1pbiIsImlzTG9nZ2VkSW4iOnRydWUsImlhdCI6MTYyMTgzODQ2NSwiZXhwIjoxNjIxOTI0ODY1fQ.2_M-AgaZuBbgByTZBfUiAqcAMwFcP3EzsT0K9nM4_OU';
const inServiceId = 0;


describe('InServicesController', () => {
  describe('#add()', () => {
    it('Add InServices', (done) => {
       supertest(sails.hooks.http.app)
        .post('/inServices')
        .set('Authorization', token)
        .send({
            "status" : "Exceed",
            "date" : "01/06/2021 - 10.50AM",
            "administrator": "Anjali",
            "in_service" : "1C. Consciuos lorep ipsum",
            "employee_id" : "44"
          })
          .expect('Content-type',/json/)
          .expect(200)
          .end((err, res) => {
            if (err) {return done(err);}
            done();
          });
    });
  });

  describe('#find()', () => {
    it('Show all InServices', (done) => {
      supertest(sails.hooks.http.app)
        .get('/inServices')
        .set('Authorization', token)
        // .expect(200)
        .end((err, res) => {
          if (err) {return done(err);}
          done(res);
        });
    });
  });

  describe('#findbyId()', () => {
    it('Find InServices By Id', (done) => {
      supertest(sails.hooks.http.app)
        .get('/inServices/' + inServiceId)
        .set('Authorization', token)
        .expect(200)
        .end((err, res) => {
          if (err) {return done(err);}
          done();
        });
    });
  });

  describe('#delete()', () => {
    it('Delete InServices By Id', (done) => {
      supertest(sails.hooks.http.app)
        .delete('/inServices/' + inServiceId)
        .set('Authorization', token)
        .expect(200)
        .end((err, res) => {
          if (err) {return done(err);}
          done();
        });
    });
  });

  describe('#edit()', () => {
    it('Edit InServices', (done) => {
       supertest(sails.hooks.http.app)
        .put('/inServices/' + inServiceId)
        .set('Authorization', token)
        .send({
            "status" : "Exceed",
            "date" : "01/06/2021 - 10.50AM",
            "administrator": "Anjali",
            "in_service" : "1C. Consciuos lorep ipsum",
          })
          .expect('Content-type',/json/)
          .expect(200)
          .end((err, res) => {
            if (err) {return done(err);}
            done();
          });
    });
  });

});
