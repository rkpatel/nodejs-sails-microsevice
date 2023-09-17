/***************************************************************************

  Model          : NotificationTemplate
  Database Table : notification_template

  **************************************************
  Column      :   type
  **************************************************

  notification_template_id  :   number
  account_id                :   number
  name      :   string
  code      :   string
  status    :   enum
  description  :   number
  notification_type: enum,
  subject :string
  body :string
  permission_id : number
  default_recipeints : string
  created_by          :   number
  created_date        :   datetime
  last_updated_by     :   number
  last_updated_date   :   datetime
  **************************************************

***************************************************************************/

module.exports = {
  tableName  : 'notification_template',
  primaryKey : 'notification_template_id',
  attributes : {
    notification_template_id : { type: 'number', autoIncrement: true },
    name                     : { type: 'string' },
    description              : { type: 'string' },
    code                     : { type: 'string' },
    notification_type        : { type: 'string', isIn: ['SMS', 'Email', 'Mobile', 'InApp'] },
    subject                  : { type: 'string' },
    body                     : { type: 'string' },
    permission_id            : { type: 'number' },
    default_recipeints       : { type: 'number' },
    status                   : { type: 'string', isIn: ['Inactive', 'Active'] },
    created_by               : { type: 'number' },
    created_date             : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
    last_updated_by          : { type: 'number' },
    last_updated_date        : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
  }
};


