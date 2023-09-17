const supertest = require('supertest');
const sails = require('sails');
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mywicm9sZSI6ImFkbWluIiwiaXNMb2dnZWRJbiI6dHJ1ZSwiaWF0IjoxNjIxODM2OTcxLCJleHAiOjE2MjE5MjMzNzF9._yUE8FnG7Ss7gqXcjP6XNOWXUNidihdtv0K_E3fpiOM';
const notesId = 0;


describe('NotesController', () => {
  describe('#add()', () => {
    it('Add Notes', (done) => {
       supertest(sails.hooks.http.app)
        .post('/notes')
        .set('Authorization', token)
        .send({
            "name" : "anjalitest",
            "description" : "test test test",
            "date_time" : "01/06/2021 - 10.50AM",
            "field_location": "Anjali",
            "time" : "1C. Consciuos lorep ipsum",
            "employee_id" : "44",
            "image"     : "",
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
    it('Show all Notes', (done) => {
      supertest(sails.hooks.http.app)
        .get('/notes')
        .set('Authorization', token)
        .expect(200)
        .end((err, res) => {
          if (err) {return done(err);}
          done();
        });
    });
  });

  describe('#findbyId()', () => {
    it('Find Notes By Id', (done) => {
      supertest(sails.hooks.http.app)
        .get('/notes/' + notesId)
        .set('Authorization', token)
        .expect(200)
        .end((err, res) => {
          if (err) {return done(err);}
          done();
        });
    });
  });

  describe('#delete()', () => {
    it('Delete Notes By Id', (done) => {
      supertest(sails.hooks.http.app)
        .delete('/notes/' + notesId)
        .set('Authorization', token)
        .expect(200)
        .end((err, res) => {
          if (err) {return done(err);}
          done();
        });
    });
  });

  describe('#edit()', () => {
    it('Edit Notes', (done) => {
       supertest(sails.hooks.http.app)
        .put('/notes/' + notesId)
        .set('Authorization', token)
        .send({
            "name" : "anjalitest update",
            "description" : "test test test update",
            "date_time" : "01/06/2021 - 10.50AM",
            "field_location": "Anjali",
            "time" : "1C. Consciuos lorep ipsum",
            "image"     : "",
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
