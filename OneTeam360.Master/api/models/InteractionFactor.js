
module.exports = {
  tableName  : 'interaction_factor',
  primaryKey : 'interaction_factor_id',
  attributes : {
    interaction_factor_id : { type: 'number', autoIncrement: true },
    name                  : { type: 'string' },
    description           : { type: 'string' },
    weighted_tier_id      : { model: 'WeightedTier' },
    status                : { type: 'string', isIn: ['Inactive', 'Active'] },
    created_by            : { type: 'number' },
    created_date          : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
    last_updated_by       : { type: 'number',allowNull: true },
    last_updated_date     : { type: 'ref', columnType: 'datetime', autoUpdatedAt: false }
  },

  customToJSON: function() {
    return _.omit(this, ['created_by', 'last_updated_by', 'created_date', 'last_updated_date']);
  }
};




