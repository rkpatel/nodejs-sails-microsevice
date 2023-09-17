/***************************************************************************

   Model          : NotificationTemplate
   Database Table : notification_template

***************************************************************************/

module.exports = {
  tableName  : 'notification_template',
  primaryKey : 'notification_template_id',
  attributes : {
    notification_template_id : { type: 'number', autoIncrement: true },
    name                     : { type: 'string', required: true },
    description              : { type: 'string' },
    code                     : { type: 'string', required: true },
    notification_type        : { type: 'string', isIn: ['SMS','Email','Mobile','InApp'] },
    subject                  : { type: 'string', required: true },
    body                     : { type: 'string', required: true },
    status                   : { type: 'string' , isIn: ['Active', 'Inactive']  },
    default_recipeints       : { type: 'string' },
    created_by               : { type: 'number' },
    created_date             : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
    last_updated_by          : { type: 'number' },
    last_updated_date        : {
      type          : 'ref',
      columnType    : 'datetime',
      autoCreatedAt : true,
    },
  },
};



