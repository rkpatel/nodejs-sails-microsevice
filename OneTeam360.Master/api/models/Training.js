/***************************************************************************

  Model          : TrainingCategory
  Database Table : training

***************************************************************************/

module.exports = {
  tableName  : 'training',
  primaryKey : 'training_id',
  attributes : {
    training_id          : { type: 'number', autoIncrement: true },
    training_category_id : { model: 'TrainingCategory'},
    name                 : { type: 'string' },
    description          : { type: 'string' },
    status               : { type: 'string', isIn: ['Inactive', 'Active'] },
    created_by           : { type: 'number' },
    created_date         : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
    last_updated_by      : { type: 'number', allowNull: true },
    last_updated_date    : { type: 'ref', columnType: 'datetime', autoUpdatedAt: false },
  },

};

