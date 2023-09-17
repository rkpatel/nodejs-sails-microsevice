
module.exports = {
  tableName  : 'subscription_plan',
  primaryKey : 'subscription_plan_id',
  attributes : {
    subscription_plan_id : { type: 'number', autoIncrement: true },
    name                 : { type: 'string' },
    description          : { type: 'string' },
    bill_interval        : { type: 'number' },
    min_price            : { type: 'number' },
    status               : { type: 'string' },
  }
};
