

module.exports = {
  tableName  : 'grade',
  primaryKey : 'grade_id',
  attributes : {
    grade_id          : { type: 'number', autoIncrement: true },
    name              : { type: 'string' },
    description       : { type: 'string' },
    status            : { type: 'string', isIn: ['Inactive', 'Active'] },
    icon_name         : { type: 'string' },
    created_by        : { type: 'number' },
    created_date      : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
    last_updated_by   : { type: 'number', allowNull: true },
    last_updated_date : { type: 'ref', columnType: 'datetime', autoUpdatedAt: false }
  }
};



