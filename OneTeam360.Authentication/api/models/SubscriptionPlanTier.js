module.exports = {
  tableName  : 'subscription_plan_tier',
  primaryKey : 'subscription_plan_tier_id',
  attributes : {
    subscription_plan_tier_id : { type: 'number', autoIncrement: true },
    subscription_plan_id      : {model: 'SubscriptionPlan'},
    seats_from_range          : { type: 'string' },
  }
};
