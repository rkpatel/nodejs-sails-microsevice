/***************************************************************************

  Model          : TrainingCategory
  Database Table : training_category

***************************************************************************/

module.exports = {
  tableName  : 'training_category',
  primaryKey : 'training_category_id',
  attributes : {
    training_category_id : { type: 'number', autoIncrement: true },
    name                 : { type: 'string' },
    description          : { type: 'string' },
    weighted_tier_id     : { model: 'WeightedTier'},
    status               : { type: 'string', isIn: ['Inactive', 'Active'] },
    created_by           : { type: 'number' },
    created_date         : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
    last_updated_by      : { type: 'number', allowNull: true },
    last_updated_date    : { type: 'ref', columnType: 'datetime', autoUpdatedAt: false },
  },

};

