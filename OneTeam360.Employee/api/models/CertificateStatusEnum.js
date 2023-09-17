/***************************************************************************

  Model          : certificateType
  Database Table : certificate_type

***************************************************************************/

module.exports = {
  tableName  : 'certificate_status_enum',
  primaryKey : 'certificate_status_enum_id',
  attributes : {
    certificate_status_enum_id : { type: 'number', autoIncrement: true },
    name                       : { type: 'string'},
    certificate_status         : { type: 'string', isIn: ['Assigned', 'InReview', 'Active','Expired', 'Rejected'] },
    sort_order                 : { type: 'number' },
  },
};



