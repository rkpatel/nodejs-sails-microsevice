const supertest = require('supertest');
const sails = require('sails');
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mywicm9sZSI6ImFkbWluIiwiaXNMb2dnZWRJbiI6dHJ1ZSwiaWF0IjoxNjIxODM2OTcxLCJleHAiOjE2MjE5MjMzNzF9._yUE8FnG7Ss7gqXcjP6XNOWXUNidihdtv0K_E3fpiOM';
const checklistId = 0;

describe('ChecklistController', () => {
  describe('#add()', () => {
    it('Add Checklist', (done) => {
      supertest(sails.hooks.http.app)
        .post('/checklist')
        .set('Authorization', token)
        .send({
          'name'           : 'assing by name',
          'description'    : 'lorem ipson',
          'date_time'      : 'Tue 11/05/2021 – 10:50 am',
          'field_location' : 'in the field',
          'time'           : '05:00 am',
          'employee_id'    : '44'
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
    it('Show all Checklist', (done) => {
      supertest(sails.hooks.http.app)
        .get('/checklist')
        .set('Authorization', token)
        .expect(200)
        .end((err, res) => {
          if (err) {return done(err);}
          done(res);
        });
    });
  });

  describe('#findbyId()', () => {
    it('Find Checklist By Id', (done) => {
      supertest(sails.hooks.http.app)
        .get('/checklist/' + checklistId)
        .set('Authorization', token)
        .expect(200)
        .end((err) => {
          if (err) {return done(err);}
          done();
        });
    });
  });

  describe('#delete()', () => {
    it('Delete Checklist By Id', (done) => {
      supertest(sails.hooks.http.app)
        .delete('/checklist/' + checklistId)
        .set('Authorization', token)
        .expect(200)
        .end((err) => {
          if (err) {return done(err);}
          done();
        });
    });
  });

  describe('#edit()', () => {
    it('Edit Checklist', (done) => {
      supertest(sails.hooks.http.app)
        .put('/checklist/' + checklistId)
        .set('Authorization', token)
        .send({
          'name'           : 'assing by name edit',
          'description'    : 'lorem ipson',
          'date_time'      : 'Tue 11/05/2021 – 10:50 am',
          'field_location' : 'in the field',
          'time'           : '05:00 am',
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
