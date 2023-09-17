/***************************************************************************

  Controller     : Tenant Employee Profile notes

***************************************************************************/

const {
  RESPONSE_STATUS,
  ACCOUNT_STATUS,
  NOTIFICATION_ENTITIES,
  PERMISSIONS
} = require('../utils/constants/enums');
const messages = sails.config.globals.messages;
const NotesValidations = require('../validations/NotesValidations');
const {
  getDateUTC,
  getBeforeOneYearDateUTC,
  getDateTimeSpecificTimeZone
} = require('../utils/common/getDateTime');
const { sendNotification } = require('../services/sendNotification');
const { escapeSqlSearch } = require('../services/utils');

const locatinInfo = async function (request) {
  return request.location_id ? request.location_id : null;
};

const noteCounts=async(req,_note,empnoteTypes,isViewPrivateNotes)=>{
  let chk = req.user.user_id === _note.created_by || req.empProfile.employee_profile_id === _note.employee_profile_id || isViewPrivateNotes;
  let chk1 = chk ? true : false;
  return empnoteTypes ? empnoteTypes.filter((note) => note.is_private ? chk1 : true).length : 0;

};

const empNotesCount=async(totalEmpNotes,bool,req)=>{
  return totalEmpNotes
          ? totalEmpNotes.filter((note) => {
            let bool = false;
            if (note.is_private) {
              if (req.user.user_id === note.created_by) {
                bool = true;
              } else {
                bool = false;
              }
            } else {
              bool = true;
            }

            if (bool && note.note_type_id.status === ACCOUNT_STATUS.active) {
              return true;
            } else {
              return false;
            }
          }).length
          : 0;
};

const empNoteTyp=async(empnoteTypes,req)=>{
  return empnoteTypes.filter((note) => {
    if (note.is_private) {
      return req.user.user_id === note.created_by;
    }
    else {
      return true;
    }
  }).length;
};

const empNotCount=async(empnoteTypes,chk)=>{
  return empnoteTypes ? chk : 0;
};

const matchReqAndNoteProfile=async(req,note,isViewPrivateNotes)=>{
  if (req.empProfile.employee_profile_id === note.employee_profile_id) {
    return true;
  }
  else {
    return isViewPrivateNotes;
  }
};

const allData=async(rawResult,req,isViewPrivateNotes)=>{
  return rawResult.rows
  ? rawResult.rows
    .filter((note) => {
      if (note.is_private) {
        if (req.user.user_id === note.created_by) {
          return true;
        }
        else {
          return matchReqAndNoteProfile(req,note,isViewPrivateNotes);
        }
      }
      else {
        return true;
      }
    })

    .map((note) => {
      return {
        is_private         : note.is_private,
        employee_note_id   : note.employee_note_id,
        employee_note_type : {
          note_type    : note.note_type_name,
          note_type_id : note.note_type_id,
        },
        description : note.description,
        location    : note.location_name,
        created_by  : {
          first_name                    : note.created_by_first_name,
          last_name                     : note.created_by_last_name,
          profile_picture_thumbnail_url :
            note.created_by_profile_picture_thumbnail_url,
          profile_picture_url : note.created_by_profile_picture_url,
          created_date        : note.created_date
            ? getDateTimeSpecificTimeZone(
              note.created_date,
              req.timezone,
              req.dateTimeFormat
            )
            : '',
        },
      };
    })
  : [];
};

module.exports = {
  add: async (req, res) => {
    try {
      let request = req.allParams();
      const isValidate = await NotesValidations.add.validate(request);

      if (!isValidate.error) {
        // Check weather note_type is active or not
        let noteTypeExist = await NoteType.findOne({
          note_type_id : request.note_type_id,
          status       : ACCOUNT_STATUS.active,
        }).usingConnection(req.dynamic_connection);
        if (noteTypeExist) {
          let empNote = await EmployeeNote.create({
            location_id         : await locatinInfo(request),
            employee_profile_id : request.employee_profile_id,
            note_type_id        : request.note_type_id,
            description         : request.description,
            is_private          : request.is_private,
            status              : ACCOUNT_STATUS.active,
            created_by          : req.user.user_id,
            last_updated_by     : req.user.user_id,
            created_date        : getDateUTC(),
          })
            .fetch()
            .usingConnection(req.dynamic_connection);
          const users = await Users.findOne({ user_id: req.user.user_id });
          let objSendNotification = noteTypeExist.send_notification && !request.is_private;
          if (objSendNotification) {
            let empProfile = await EmployeeProfile.findOne({
              employee_profile_id: request.employee_profile_id,
            }).usingConnection(req.dynamic_connection);
            let user = await Users.findOne({ user_id: empProfile.user_id });

            await sendNotification(req, {
              notification_entity            : NOTIFICATION_ENTITIES.ADD_NOTE,
              receipient_employee_profile_id : empProfile.employee_profile_id,
              receipient_user_id             : user.user_id,
              recipient_email                : user.email,
              recipient_first_name           : user.first_name,
              recipient_last_name            : user.last_name,
              employee_name                  : `${users.first_name} ${users.last_name}`,
              note_type                      : noteTypeExist.name,
              note_description               : request.description,
              account_id                     : req.account.account_id,
              employee_note_id               : empNote.employee_note_id,
            });

          }
          if (noteTypeExist.notify_management_user) {
            let empProfile = await EmployeeProfile.findOne({
              employee_profile_id: request.employee_profile_id,
            }).usingConnection(req.dynamic_connection);
            let user = await Users.findOne({ user_id: empProfile.user_id });
            await sendNotification(req, {
              notification_entity            : NOTIFICATION_ENTITIES.ADD_NOTE_NOTIFY_MANAGER,
              receipient_employee_profile_id : empProfile.employee_profile_id,
              receipient_user_id             : user.user_id,
              recipient_email                : user.email,
              created_by                     : `${user.first_name} ${user.last_name}`,
              recipient_first_name           : user.first_name,
              recipient_last_name            : user.last_name,
              employee_name                  : `${users.first_name} ${users.last_name}`,
              note_type                      : noteTypeExist.name,
              note_description               : request.description,
              account_id                     : req.account.account_id,
              account_name                   : req.account.account_name,
              employee_note_id               : empNote.employee_note_id,
            });

          }
          let locationName = '';
          if(empNote.location_id !== null){
            let sql = `
              SELECT 
              name 
            FROM location
            where location_id= ${empNote.location_id}`;
            const rawResult = await sails
                .sendNativeQuery(escapeSqlSearch(sql))
                .usingConnection(req.dynamic_connection);
            locationName = rawResult.rows[0];
          }

          let data = {
            note_id   : empNote.employee_note_id,
            note_type : {
              note_type_id : empNote.note_type_id,
              name         : noteTypeExist.name
            },
            employee_profile_id : empNote.employee_profile_id,
            description         : empNote.description,
            is_private          : empNote.is_private,
            location            : empNote.location_id !== null ? {
              location_id : empNote.location_id,
              name        : locationName.name
            } : null,
            created_by   : `${users.first_name} ${users.last_name}`,
            created_date : getDateUTC(noteTypeExist.created_date)
          };
          res.ok(data, messages.ADD_NOTE_SUCCESS, RESPONSE_STATUS.success);
        } else {
          res.ok(
            undefined,
            messages.NOTE_TYPE_NOT_EXIST,
            RESPONSE_STATUS.success
          );
        }
      } else {
        res.ok(
          isValidate.error,
          messages.ADD_NOTE_FAILURE,
          RESPONSE_STATUS.error
        );
      }
    } catch (error) {
      sails.log.error(error);
      let errorData={
        data      : null,
        imageName : null,
      };
      res.ok({}, messages.ADD_NOTE_FAILURE, RESPONSE_STATUS.error);
    }
  },
  types: async (req, res) => {
    try {
      let request = req.allParams();
      const isValidate = await NotesValidations.types.validate(request);
      if (!isValidate.error) {
        let noteTypes = await NoteType.find({
          where: { status: ACCOUNT_STATUS.active },
        })
          .sort('name ASC')
          .usingConnection(req.dynamic_connection);

        let index = noteTypes.findIndex((item) => item.is_default === true);
        if (index !== -1) {
          noteTypes.unshift(noteTypes.splice(index, 1)[0]);
        }
        let response = [];
        let permissions = req.permissions.map(perm => perm.code);
        let isViewPrivateNotes = permissions.includes(PERMISSIONS.VIEW_PRIVATE_NOTES);
        noteTypes = noteTypes
          ? noteTypes.map(async (_note) => {
            let empnoteTypes = await EmployeeNote.find({
              employee_profile_id : request.employee_profile_id,
              note_type_id        : _note.note_type_id,
              status              : ACCOUNT_STATUS.active,
            }).usingConnection(req.dynamic_connection);

            let _empNoteCount=  await noteCounts(req,_note,empnoteTypes,isViewPrivateNotes);

            return {
              note_type_id : _note.note_type_id,
              name         : _note.name,
              count        : _empNoteCount,
            };
          })
          : [];

        if (noteTypes) {
          response = await Promise.all(noteTypes);
        }
        res.ok(response, messages.NOTE_TYPES, RESPONSE_STATUS.success);
      } else {
        res.ok(
          isValidate.error,
          messages.GET_RECORD_FAILURE,
          RESPONSE_STATUS.error
        );
      }
    } catch (error) {
      sails.log.error(error);
      res.ok(undefined, messages.GET_RECORD_FAILURE, RESPONSE_STATUS.error);
    }
  },
  graph: async (req, res) => {
    try {
      let request = req.allParams();
      const isValidate = await NotesValidations.types.validate(request);
      if (!isValidate.error) {
        let noteTypes = await NoteType.find({
          where: {
            status: ACCOUNT_STATUS.active,
          },
          sort: [
            {
              name: 'ASC',
            },
          ],
        }).usingConnection(req.dynamic_connection);

        let index = noteTypes.findIndex((item) => item.is_default === true);
        if (index !== -1) {
          noteTypes.unshift(noteTypes.splice(index, 1)[0]);
        }
        let totalEmpNotes = await EmployeeNote.find({
          employee_profile_id : request.employee_profile_id,
          status              : ACCOUNT_STATUS.active,
          created_date        : {
            '>=': getBeforeOneYearDateUTC(),
          },
        })
          .populate('note_type_id')
          .usingConnection(req.dynamic_connection);

        let bool = false;
        let _totalEmpNoteCount = await empNotesCount(totalEmpNotes,bool,req);

        let response = [];

        noteTypes = noteTypes
          ? noteTypes.map(async (_note) => {
            let empnoteTypes = await EmployeeNote.find({
              employee_profile_id : request.employee_profile_id,
              note_type_id        : _note.note_type_id,
              status              : ACCOUNT_STATUS.active,
              created_date        : {
                '>=': getBeforeOneYearDateUTC(),
              },
            }).usingConnection(req.dynamic_connection);
            let chk = await empNoteTyp(empnoteTypes,req);
            let _empNoteCount = await empNotCount(empnoteTypes,chk);

            let _stat = Number(_totalEmpNoteCount) !== 0 ?
              (Number(_empNoteCount) * 100) / Number(_totalEmpNoteCount) : 0;
            _stat = _stat ? _stat.toFixed(2) : 0;
            return {
              note_type_id : _note.note_type_id,
              name         : _note.name,
              count        : _empNoteCount,
              statistic    : _stat,
            };
          })
          : [];
        if (noteTypes) {
          response = await Promise.all(noteTypes);
        }
        res.ok(response, messages.NOTE_TYPES, RESPONSE_STATUS.success);
      } else {
        res.ok(
          isValidate.error,
          messages.GET_RECORD_FAILURE,
          RESPONSE_STATUS.error
        );
      }
    } catch (error) {
      sails.log.error(error);
      res.ok(undefined, messages.GET_RECORD_FAILURE, RESPONSE_STATUS.error);
    }
  },
  find: async (req, res) => {
    try {
      let request = req.allParams();
      const isValidate = await NotesValidations.find.validate(request);
      if (!isValidate.error) {
        let { offset, perPage, note_type_id, employee_profile_id } = request;
        let sql = `
          SELECT 
            em_n.employee_note_id,
            em_n.description,
            em_n.is_private,
            em_n.created_by,
            em_n.employee_profile_id,
            note_type.note_type_id as note_type_id,
            note_type.name as note_type_name,
            created_by_user.first_name as created_by_first_name,
            created_by_user.last_name as created_by_last_name,
            created_by_user.profile_picture_thumbnail_url as created_by_profile_picture_thumbnail_url,
            created_by_user.profile_picture_url as created_by_profile_picture_url,
            em_n.created_date,
            location.name as location_name
          FROM employee_note em_n
            LEFT JOIN employee_profile em_p
              ON em_n.employee_profile_id = em_p.employee_profile_id
            LEFT JOIN note_type
              ON em_n.note_type_id = note_type.note_type_id
            LEFT JOIN location
              ON em_n.location_id = location.location_id
            LEFT JOIN ${process.env.DB_NAME}.user created_by_user
              ON em_n.created_by = created_by_user.user_id
          where em_n.employee_profile_id = $1 and em_n.status = $3 and note_type.status = $3 `;

        if (note_type_id && note_type_id !== '') {
          if (Array.isArray(note_type_id)) {
            sql += ` and em_n.note_type_id IN (${note_type_id.join(',')}) `;
          } else {
            sql += ` and em_n.note_type_id = $2 `;
          }
        }

        sql = sql + ` ORDER BY em_n.created_date DESC`;

        let countsql = `Select count(em_n.employee_note_id) as count FROM ${sql.split(' FROM ')[1]
        }`;

        if (offset && perPage && Number(offset) && Number(perPage)) {
          sql += ` LIMIT $4 OFFSET $5 `;
        }
        const rawResult = await sails
          .sendNativeQuery(`${escapeSqlSearch(sql)};`, [
            employee_profile_id,
            note_type_id,
            ACCOUNT_STATUS.active,
            Number(perPage),
            Number(offset - 1),
          ])
          .usingConnection(req.dynamic_connection);
        const countRawResult = await sails
          .sendNativeQuery(`${escapeSqlSearch(countsql)};`, [
            employee_profile_id,
            note_type_id,
            ACCOUNT_STATUS.active,
          ])
          .usingConnection(req.dynamic_connection);
        let count = countRawResult.rows[0].count;
        let permissions = req.permissions.map(perm => perm.code);
        let isViewPrivateNotes = permissions.includes(PERMISSIONS.VIEW_PRIVATE_NOTES);
        let response = await allData(rawResult,req,isViewPrivateNotes);
        let message = messages.NO_NOTES_ADDED;
        if (response.length > 0) {
          message = messages.GET_RECORD;
        }
        let data = {
          totalRecords : count,
          notesList    : response,
        };
        res.ok(data, message, RESPONSE_STATUS.success);
      } else {
        res.ok(
          isValidate.error,
          messages.GET_RECORD_FAILURE,
          RESPONSE_STATUS.error
        );
      }
    } catch (error) {
      sails.log.error(error);
      res.ok(undefined, messages.GET_RECORD_FAILURE, RESPONSE_STATUS.error);
    }
  },
  delete: async (req, res) => {
    const isValidate = await NotesValidations.delete.validate(req.params);
    if (!isValidate.error) {
      await EmployeeNote.update(
        {
          employee_note_id: req.params.id,
        },
        {
          status            : ACCOUNT_STATUS.inactive,
          last_updated_by   : req.user.user_id,
          last_updated_date : getDateUTC(),
        }
      ).usingConnection(req.dynamic_connection);
      res.ok(undefined, messages.NOTE_DELETE_SUCCESS, RESPONSE_STATUS.success);
    } else {
      res.ok(isValidate.error, messages.DELETE_FAILURE, RESPONSE_STATUS.error);
    }
  },
};
