/***************************************************************************

  Model          : Relation
  Database Table : relation

***************************************************************************/

module.exports = {
  tableName  : 'relation',
  primaryKey : 'relation_id',
  attributes : {
    relation_id    : { type: 'number', autoIncrement: true },
    relation_name  : { type: 'string'},
    relation_value : { type: 'string'}
  },
};
