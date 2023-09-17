/***************************************************************************

  Model          : FeedbackRatingScale
  Database Table : feedback_rating_scale

***************************************************************************/

module.exports = {
  tableName  : 'feedback_rating_scale',
  primaryKey : 'feedback_rating_scale_id',
  attributes : {
    feedback_rating_scale_id : { type: 'number', autoIncrement: true },
    name                     : { type: 'string', required: true },
    description              : { type: 'string', allowNull: true},
    scale                    : { type: 'number', required: true},
    status                   : { type: 'string', isIn: ['Inactive', 'Active']},
    created_by               : { type: 'number', allowNull: true},
    created_date             : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
    modified_by              : { type: 'number', allowNull: true},
    modified_date            : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
  },
};

