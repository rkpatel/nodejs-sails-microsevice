const supertest = require('supertest');
const sails = require('sails');

process.env.JWT_SECRET_KEY='123456546465';
process.env.EMAIL_USERNAME='jtrivedi@synoptek.com';
process.env.ALLOW_ORIGINS='http://localhost:8081';
process.env.APP_BASE_URL='http://localhost:8080/';
process.env.DB_NAME='masterdb';
let not_exits_competition_id = 1;
let competition_id = 85;
let token = '';

const allData=async(err,response,done)=>{
  if (err) {
    return done(err);
  } else {
    response.body.should.be.an('object');
    response.body.should.have.property('data');
    response.body.should.have.property('status', 'error');
    response.body.should.have.property('message', 'Validation Error');
    return done();
  }
};

describe('CompetitionController', () => {
  describe('#Login()', () => {
    it('Login User', (done) => {
      supertest(process.env.APP_BASE_URL+'authentication')
      .post('/login')
      .send({ email: 'tdalal@synoptek.com', password: 'Test@1234' })
      .end((err, res) => {
        if(err)
        {
          return done(err);
        }
        token = res.body.data.token;
        return done();
      });
    });
  });

  describe('#add()', () => {
    it('Add Competition', (done) => {
      const request = {
        'name'             : 'TDD 3',
        'description'      : 'TDD description 3',
        'start_date'       : '2021-09-22',
        'end_date'         : '2021-09-30',
        'competition_file' : '65ae9d8d-482f-4e2c-bf30-dc606ddd75b1.jpg',
        'employees'        : [21,22,25],
        'locations'        : [14,15,16],
        'job_types'        : [1]
      };
      supertest(sails.hooks.http.app)
      .post('/add')
      .set('Authorization', 'Bearer '+ token)
      .send(request)
      .expect('Content-type',/json/)
      .expect(200)
      .end((err, response) => {
        if (err) {
          return done(err);
        } else {
          response.body.should.be.an('object');
          response.body.should.have.property('data');
          response.body.should.have.property('status', 'success');
          response.body.should.have.property('message', 'Competition created successfully.');
          return done();
        }
      });
    });

    it('Add Competition with employee value not pass as array', (done) => {
      const request = {
        'name'             : 'TDD 3',
        'description'      : 'TDD description 3',
        'start_date'       : '2021-09-22',
        'end_date'         : '2021-09-30',
        'competition_file' : '65ae9d8d-482f-4e2c-bf30-dc606ddd75b1.jpg',
        'employees'        : '',
        'locations'        : [14,15,16],
        'job_types'        : [1]
      };
      supertest(sails.hooks.http.app)
      .post('/add')
      .set('Authorization', 'Bearer '+ token)
      .send({request})
      .expect('Content-type',/json/)
      .expect(200)
      .end((err, response) => {
        allData(err,response,done);
      });
    });

    it('Add Competition with locations value not pass as array', (done) => {
      const request = {
        'name'             : 'TDD 3',
        'description'      : 'TDD description 3',
        'start_date'       : '2021-09-22',
        'end_date'         : '2021-09-30',
        'competition_file' : '65ae9d8d-482f-4e2c-bf30-dc606ddd75b1.jpg',
        'employees'        : [21,22,25],
        'locations'        : '',
        'job_types'        : [1]
      };
      supertest(sails.hooks.http.app)
      .post('/add')
      .set('Authorization', 'Bearer '+ token)
      .send({request})
      .expect('Content-type',/json/)
      .expect(200)
      .end((err, response) => {
        allData(err,response,done);
      });
    });

    it('Add Competition with job_types value not pass as array', (done) => {
      const request = {
        'name'             : 'TDD 3',
        'description'      : 'TDD description 3',
        'start_date'       : '2021-09-22',
        'end_date'         : '2021-09-30',
        'competition_file' : '65ae9d8d-482f-4e2c-bf30-dc606ddd75b1.jpg',
        'employees'        : [21,22,25],
        'locations'        : [14,15,16],
        'job_types'        : ''
      };
      supertest(sails.hooks.http.app)
      .post('/add')
      .set('Authorization', 'Bearer '+ token)
      .send({request})
      .expect('Content-type',/json/)
      .expect(200)
      .end((err, result) => {
        if (err) {
          return done(err);
        } else {
          result.body.should.be.an('object');
          result.body.should.have.property('data');
          result.body.should.have.property('status', 'error');
          result.body.should.have.property('message', 'Validation Error');
          return done();
        }
      });
    });

    it('Add Competition with start date is grater than end date', (done) => {
      const request = {
        'name'             : 'TDD 3',
        'description'      : 'TDD description 3',
        'start_date'       : '2021-10-30',
        'end_date'         : '2021-10-15',
        'competition_file' : '65ae9d8d-482f-4e2c-bf30-dc606ddd75b1.jpg',
        'employees'        : [21,22,25],
        'locations'        : [14,15,16],
        'job_types'        : [1]
      };
      supertest(sails.hooks.http.app)
      .post('/add')
      .set('Authorization', 'Bearer '+ token)
      .send(request)
      .expect('Content-type',/json/)
      .expect(200)
      .end((err, response) => {
        if (err) {
          return done(err);
        } else {
          response.body.should.be.an('object');
          response.body.should.have.property('status', 'error');
          response.body.should.have.property('message', 'Competition end date not less than start date');
          return done();
        }
      });
    });
  });

  describe('#findById()', () => {
    it('Edit Competition', (done) => {
      supertest(sails.hooks.http.app)
      .get('/edit/'+competition_id)
      .set('Authorization', 'Bearer '+ token)
      .expect('Content-type',/json/)
      .expect(200)
      .end((err, response) => {
        if (err)
        {
          return done(err);
        }
        response.body.should.be.an('object');
        response.body.should.have.property('status', 'success');
        response.body.should.have.property('message', 'Record get successful');
        response.body.should.have.property('data');
        response.body.data.should.be.an('object');
        let competition_details = response.body.data;
        competition_details.should.have.property('competition_id');
        competition_details.should.have.property('name');
        competition_details.should.have.property('description');
        competition_details.should.have.property('start_date');
        competition_details.should.have.property('end_date');
        competition_details.should.have.property('banner_image_url');
        competition_details.should.have.property('competition_status');
        competition_details.should.have.property('locations');
        competition_details.should.have.property('locations').be.an('array');
        competition_details.should.have.property('job_types');
        competition_details.should.have.property('job_types').be.an('array');
        competition_details.should.have.property('employees');
        competition_details.should.have.property('employees').be.an('array');
        return done();
      });
    });

    it('Edit Competition with no record found', (done) => {
      supertest(sails.hooks.http.app)
      .get('/edit/'+not_exits_competition_id)
      .set('Authorization', 'Bearer '+ token)
      .expect('Content-type',/json/)
      .expect(200)
      .end((err, response) => {
        if (err)
        {
          return done(err);
        }
        response.body.should.be.an('object');
        response.body.should.have.property('status', 'success');
        response.body.should.have.property('message', 'No matching record found');
        return done();
      });
    });
  });


  describe('#update()', () => {
    it('Update Competition', (done) => {
      const request = {
        'name'             : 'TDD Update 4',
        'description'      : 'Test competition final description 4',
        'start_date'       : '2021-10-10',
        'end_date'         : '2021-10-11',
        'competition_file' : '65ae9d8d-482f-4e2c-bf30-dc606ddd75b1.jpg',
        'employees'        : [21],
        'locations'        : [14],
        'job_types'        : [1]
      };
      supertest(sails.hooks.http.app)
      .put('/update/' + competition_id)
      .set('Authorization', 'Bearer '+ token)
      .send(request)
      .expect('Content-type',/json/)
      .expect(200)
      .end((err, response) => {
        if (err)
        {
          return done(err);
        }
        response.body.should.be.an('object');
        response.body.should.have.property('status', 'success');
        response.body.should.have.property('message', 'Competition updated successfully.');
        return done();
      });
    });

    it('Update Competition with no record exists', (done) => {
      const request = {
        'name'             : 'TDD Update 4',
        'description'      : 'Test competition final description 4',
        'start_date'       : '2021-10-10',
        'end_date'         : '2021-10-11',
        'competition_file' : '65ae9d8d-482f-4e2c-bf30-dc606ddd75b1.jpg',
        'employees'        : [21],
        'locations'        : [14],
        'job_types'        : [1]
      };
      supertest(sails.hooks.http.app)
      .put('/update/' + not_exits_competition_id)
      .set('Authorization', 'Bearer '+ token)
      .send(request)
      .expect('Content-type',/json/)
      .expect(200)
      .end((err, response) => {
        if (err)
        {
          return done(err);
        }
        response.body.should.be.an('object');
        response.body.should.have.property('status', 'error');
        response.body.should.have.property('message', 'No matching record found');
        return done();
      });
    });

    it('Update Competition with employee not pass as array', (done) => {
      const request = {
        'name'             : 'TDD 3',
        'description'      : 'TDD description 3',
        'start_date'       : '2021-09-22',
        'end_date'         : '2021-09-30',
        'competition_file' : '65ae9d8d-482f-4e2c-bf30-dc606ddd75b1.jpg',
        'employees'        : '',
        'locations'        : [14,15,16],
        'job_types'        : [1]
      };
      supertest(sails.hooks.http.app)
      .put('/update/' + not_exits_competition_id)
      .set('Authorization', 'Bearer '+ token)
      .send(request)
      .expect('Content-type',/json/)
      .expect(200)
      .end((err, response) => {
        if (err)
        {
          return done(err);
        }
        response.body.should.be.an('object');
        response.body.should.have.property('status', 'error');
        response.body.should.have.property('message', 'Validation Error');
        return done();
      });
    });

    it('Update Competition with locations not pass as array', (done) => {
      const request = {
        'name'             : 'TDD Update 4',
        'description'      : 'Test competition final description 4',
        'start_date'       : '2021-10-10',
        'end_date'         : '2021-10-11',
        'competition_file' : '65ae9d8d-482f-4e2c-bf30-dc606ddd75b1.jpg',
        'employees'        : [21,22,25],
        'locations'        : '',
        'job_types'        : [1]
      };
      supertest(sails.hooks.http.app)
      .put('/update/' + not_exits_competition_id)
      .set('Authorization', 'Bearer '+ token)
      .send(request)
      .expect('Content-type',/json/)
      .expect(200)
      .end((err, res) => {
        if (err)
        {
          return done(err);
        }
        res.body.should.be.an('object');
        res.body.should.have.property('status', 'error');
        res.body.should.have.property('message', 'Validation Error');
        return done();
      });
    });

    it('Update Competition with job_type not pass as array', (done) => {
      const request = {
        'name'             : 'TDD 3',
        'description'      : 'TDD description 3',
        'start_date'       : '2021-09-22',
        'end_date'         : '2021-09-30',
        'competition_file' : '65ae9d8d-482f-4e2c-bf30-dc606ddd75b1.jpg',
        'employees'        : [21,22,25],
        'locations'        : [14,15,16],
        'job_types'        : ''
      };
      supertest(sails.hooks.http.app)
      .put('/update/' + not_exits_competition_id)
      .set('Authorization', 'Bearer '+ token)
      .send(request)
      .expect('Content-type',/json/)
      .expect(200)
      .end((err, resp) => {
        if (err)
        {
          return done(err);
        }
        resp.body.should.be.an('object');
        resp.body.should.have.property('status', 'error');
        resp.body.should.have.property('message', 'Validation Error');
        return done();
      });
    });
  });


  describe('#delete()', () => {
    it('Delete competition by id', (done) => {
      supertest(sails.hooks.http.app)
      .delete('/delete/' + competition_id)
      .set('Authorization', 'Bearer '+ token)
      .expect(200)
      .end((err, response) => {
        if (err) {return done(err);}
        response.body.should.be.an('object');
        response.body.should.have.property('status', 'success');
        response.body.should.have.property('message', 'Competition deleted successfully.');
        done();
      });
    });
    it('Delete competition by not exits id', (done) => {
      supertest(sails.hooks.http.app)
          .delete('/delete/' + not_exits_competition_id)
          .set('Authorization', 'Bearer '+ token)
          .expect(200)
          .end((err, response) => {
            if (err) {return done(err);}
            response.body.should.be.an('object');
            response.body.should.have.property('status', 'error');
            response.body.should.have.property('message', 'Competition record not found');
            done();
          });
    });
  });

  describe('#competitionHistoryList()', () => {
    it('Competition History List', (done) => {
      supertest(sails.hooks.http.app)
          .post('/history/list/')
          .set('Authorization', 'Bearer '+ token)
          .send({
            'filters': {
              'competition_name'   : '',
              'competition_status' : '',
              'locations'          : [],
              'participants_count' : '',
              'winners'            : '',
              'start_date'         : {
                'from_date' : '',
                'to_date'   : ''
              },
              'end_date': {
                'from_date' : '',
                'to_date'   : ''
              }
            },
            'sortField' : 'end_date',
            'sortOrder' : 'DESC',
            'offset'    : 0,
            'perPage'   : 10,
            'flag'      : 'all'
          })
          .expect(200)
          .end((err, response) => {
            if (err) {return done(err);}
            response.body.should.be.an('object');
            response.body.should.have.property('status', 'success');
            response.body.should.have.property('message', 'Competition list get successfully.');
            response.body.should.have.property('data');
            response.body.data.should.be.an('object');
            response.body.data.list.should.be.an('array');
            response.body.data.should.have.property('totalResults');
            done();
          });
    });
  });

  describe('#historyCards()', () => {
    it('History cards for ALL', (done) => {
      supertest(sails.hooks.http.app)
      .get('/history/cards/all')
      .set('Authorization', 'Bearer '+ token)
      .expect(200)
      .end((err, response) => {
        if (err) {return done(err);}
        response.body.should.be.an('object');
        response.body.should.have.property('status', 'success');
        response.body.should.have.property('message', 'Record get successful');
        response.body.data.should.be.an('object');
        response.body.data.latest_winner.should.be.an('array');
        response.body.data.should.have.property('ongoing_competitions');
        response.body.data.should.have.property('completed_competitions');
        response.body.data.should.have.property('your_total_competitions');
        return done();
      });
    });

    it('History cards for My', (done) => {
      supertest(sails.hooks.http.app)
      .get('/history/cards/my')
      .set('Authorization', 'Bearer '+ token)
      .expect(200)
      .end((err, res) => {
        if (err) {return done(err);}
        res.body.should.be.an('object');
        res.body.should.have.property('status', 'success');
        res.body.should.have.property('message', 'Record get successful');
        res.body.data.should.be.an('object');
        res.body.data.latest_winner.should.be.an('array');
        res.body.data.should.have.property('ongoing_competitions');
        res.body.data.should.have.property('completed_competitions');
        res.body.data.should.have.property('your_total_competitions');
        return done();
      });
    });
  });

  describe('#competitionDropDownList()', () => {
    it('Dropdown competition list', (done) => {
      supertest(sails.hooks.http.app)
          .get('/dropdown/list')
          .set('Authorization', 'Bearer '+ token)
          .expect(200)
          .end((err, response) => {
            if (err) {return done(err);}
            response.body.should.be.an('object');
            response.body.should.have.property('status', 'success');
            response.body.should.have.property('message', 'Competition dropdown list get successfully.');
            response.body.data.should.be.an('array');
            return done();
          });
    });
  });

  describe('#dashboard()', () => {
    it('Dashboard list', (done) => {
      const request = {
        'competition_id' : competition_id,
        'filters'        : {},
        'offset'         : 0,
        'perPage'        : 10,
        'sortField'      : 'emp_rank',
        'sortOrder'      : 'ASC'
      };
      supertest(sails.hooks.http.app)
      .post('/dashboard')
      .set('Authorization', 'Bearer '+ token)
      .send(request)
      .expect(200)
      .end((err, response) => {
        if (err) {return done(err);}
        response.body.should.be.an('object');
        response.body.should.have.property('status', 'success');
        response.body.should.have.property('message', 'Record get successful');
        response.body.should.have.property('data');
        response.body.data.should.be.an('object');
        response.body.data.listData.should.be.an('array');
        response.body.data.should.have.property('totalRecords');
        done();
      });
    });

    it('Dashboard list with not exits competition id', (done) => {
      const request = {
        'competition_id' : not_exits_competition_id,
        'filters'        : {},
        'offset'         : 0,
        'perPage'        : 10,
        'sortField'      : 'emp_rank',
        'sortOrder'      : 'ASC'
      };
      supertest(sails.hooks.http.app)
      .post('/dashboard')
      .set('Authorization', 'Bearer '+ token)
      .send(request)
      .expect(200)
      .end((err, response) => {
        if (err) {return done(err);}
        response.body.should.be.an('object');
        response.body.should.have.property('status', 'success');
        response.body.should.have.property('message', 'No matching record found');
        done();
      });
    });
  });

  describe('#dashboardCards()', () => {
    it('Dashboard cards', (done) => {
      supertest(sails.hooks.http.app)
      .get('/dashboard/cards/'+competition_id)
      .set('Authorization', 'Bearer '+ token)
      .expect(200)
      .end((err, response) => {
        if (err) {return done(err);}
        response.body.should.be.an('object');
        response.body.should.have.property('status', 'success');
        response.body.should.have.property('message', 'Record get successful');
        response.body.should.have.property('data');
        response.body.data.should.be.an('object');
        response.body.data.winners.should.be.an('array');
        response.body.data.should.have.property('totalparticipants');
        response.body.data.should.have.property('yourpoints');
        response.body.data.should.have.property('name');
        response.body.data.should.have.property('start_date');
        response.body.data.should.have.property('end_date');
        response.body.data.should.have.property('banner_image_url');
        response.body.data.should.have.property('progress');
        done();
      });
    });

    it('Dashboard cards with not exits competition id', (done) => {
      supertest(sails.hooks.http.app)
      .get('/dashboard/cards/'+not_exits_competition_id)
      .set('Authorization', 'Bearer '+ token)
      .expect(200)
      .end((err, res) => {
        if (err) {return done(err);}
        res.body.should.be.an('object');
        res.body.should.have.property('status', 'success');
        res.body.should.have.property('message', 'No matching record found');
        done();
      });
    });
  });
});
