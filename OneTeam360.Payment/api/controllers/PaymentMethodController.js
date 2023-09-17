const messages = sails.config.globals.messages;
const { RESPONSE_STATUS, PAYMENT_METHOD, NOTIFICATION_ENTITIES, API_ENABLED } = require('../utils/constants/enums');
const PaymentMethodValidation = require('../validations/PaymentMethodValidation');
const { getDateUTC, getTimeStampToDate } = require('../utils/common/getDateTime');
const {generateString}=require('../services/generateString');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const {sendNotification} = require('../services/sendNotification');
const {addPolicyInProductApi } = require('../utils/common/apiCall');
const getSubscriptionDetailsByStripeId = async function(_req, stripe_customer_id,stripe_subscription_id){
  let sql = `SELECT a.stripe_customer_id, asu.account_subscription_id, asu.account_id, asu.stripe_subscription_id, asu.seats, asu.next_payment_date, asu.payment_start_date, 
            asu.stripe_product_id, asu.stripe_price_id, asu.stripe_payment_intent_id, asu.stripe_payment_method_id, asu.stripe_latest_invoice_id,
	          asu.stripe_coupon_id, asu.amount_total, asu.amount_subtotal, asu.billing_cycle, asu.currency, asu.free_trial, asu.free_trial_days, asu.price_per_user,
	          asu.payment_status,a.user_exists, asu.expiry_date, asu.subscription_status, asu.created_date, asu.created_by, asu.last_updated_date, asu.last_updated_by 
            FROM account AS a 
            LEFT JOIN account_subscription AS asu ON a.account_id = asu.account_id
            WHERE (a.stripe_customer_id = '${stripe_customer_id}' AND asu.stripe_subscription_id = '${stripe_subscription_id}')`;
  const rawResult = await sails.sendNativeQuery(sql);
  return rawResult.rows[0] || null;
};

const addAppLog = async function(user_id, account_id, customer_id, title, request, response, status) {
  await AppLog.create({
    user_id,
    account_id,
    customer_id,
    title,
    request,
    response,
    status,
    created_date: getDateUTC()
  }).fetch();
};

const getSubscriptionDetails = async function(_req, stripe_id){
  let sql = `SELECT a.stripe_customer_id, asu.account_subscription_id, asu.account_id, asu.stripe_subscription_id, asu.seats, asu.next_payment_date, asu.payment_start_date, 
            asu.stripe_product_id, asu.stripe_price_id, asu.stripe_payment_intent_id, asu.stripe_payment_method_id, asu.stripe_latest_invoice_id,
	          asu.stripe_coupon_id, asu.amount_total, asu.amount_subtotal, asu.billing_cycle, asu.currency, asu.free_trial, asu.free_trial_days, asu.price_per_user,
	          asu.payment_status,a.user_exists, asu.expiry_date, asu.subscription_status, asu.created_date, asu.created_by, asu.last_updated_date, asu.last_updated_by 
            FROM account AS a 
            LEFT JOIN account_subscription AS asu ON a.account_id = asu.account_id
            WHERE (a.stripe_customer_id = '${stripe_id}' OR asu.stripe_subscription_id = '${stripe_id}')`;

  const rawResult = await sails.sendNativeQuery(sql);
  return rawResult.rows[0] || null;
};

const userIdData=async(req,defaultuser)=>{
  return req.user && req.user.user_id ? req.user.user_id : defaultuser.user_id;
};
const updateAzurepolicy = async function(_req, stripe_product_id){
  let sql = `SELECT sp.api_quota, sp.api_enabled, asu.account_id 
  FROM subscription_product AS sp 
  INNER JOIN account_subscription AS asu ON sp.subscription_id = asu.subscription_id
  WHERE sp.stripe_product_id = '${stripe_product_id}'`;
  const rawResult = await sails.sendNativeQuery(sql);
  let results = rawResult.rows;
  if(results && results.length > 0){
    for (let i of results) {
      await addPolicyInProductApi(_req, {account_id: i.account_id, api_quota: i.api_quota});
    }
  }

};

module.exports = {
  add: async(req, res) => {
    try {
      let request = req.allParams();
      const isValid = await PaymentMethodValidation.add.validate(request);
      if (!isValid.error) {
        const { id, cardNumber, exp_month, exp_year, cvc, country, postal_code, customerId } = req.allParams();
        await stripe.paymentMethods.create({
          type            : PAYMENT_METHOD.card,
          billing_details : {
            address: {
              country     : country,
              postal_code : postal_code,
            }
          },
          card: {
            number    : cardNumber,
            exp_month : exp_month,
            exp_year  : exp_year,
            cvc       : cvc,
          },
        }).then(async (paymentmethod) => {
          const paymentMethodResponse = await stripe.paymentMethods.attach(paymentmethod.id, {
            customer: customerId,
          });

          await AccountSubscription.update({ stripe_customer_id: customerId },{
            stripe_payment_method_id: paymentMethodResponse.id
          }).fetch();
        }).then(async () => {
          if(id !== ''){
            await stripe.paymentMethods.detach(id);
          }
        });
        return res.ok(undefined, messages.ADD_PAYMENTMETHOD_SUCCESS, RESPONSE_STATUS.success);
      } else {
        res.ok(isValid.error, messages.ADD_PAYMENTMETHOD_FAILURE, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(err.error, err.message, RESPONSE_STATUS.error);
    }
  },

  edit: async(req, res) => {
    try {
      let request = req.allParams();
      const isValid = await PaymentMethodValidation.edit.validate(request);
      if (!isValid.error) {
        const { id, exp_month, exp_year } = req.allParams();
        await stripe.paymentMethods.update(id,
          {
            card: {
              exp_month : exp_month,
              exp_year  : exp_year
            }
          }
        );
        return res.ok(undefined , messages.UPDATE_PAYMENTMETHOD_SUCCESS, RESPONSE_STATUS.success);
      } else {
        res.ok(isValid.error, messages.UPDATE_PAYMENTMETHOD_FAILURE, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(err.error, err.message, RESPONSE_STATUS.error);
    }
  },

  findById: async(req, res) => {
    try {
      const paymentMethodId = req.params.id;
      if(paymentMethodId !== 'null') {
        const PaymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
        if(PaymentMethod) {
          return res.ok(PaymentMethod, messages.GET_RECORD, RESPONSE_STATUS.success);
        } else {
          res.ok(isValid.error, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
        }
      } else {
        res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined,messages.SOMETHING_WENT_WRONG,RESPONSE_STATUS.error);
    }
  },

  declinedPayment: async function(req, res){
    try{
      const sig = req.headers['stripe-signature'];
      let event;
      sails.log('come-->');
      try {
        sails.log('come in-->');
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        sails.log('event data-->',event);
      } catch (err) {
        sails.log('come out-->');
        sails.log(err);
        return res.ok(`Webhook Error: ${err.message}`, 'Webhook error', RESPONSE_STATUS.error);
      }

      switch (event.type) {
        case 'invoice.payment_failed':
          sails.log('invoice.payment_failed-->');
          const invoice = event.data.object;
          if(invoice)
          {
            const billing_reason = invoice.billing_reason;
            let stripeCustomerId = invoice.customer;
            let customerDetails = await AccountSubscription.findOne({stripe_customer_id: stripeCustomerId});

            let sql = `SELECT distinct user.user_id, user.email, user.first_name, user.last_name, account.status, account.retry_count FROM user
            INNER JOIN account_user ON account_user.user_id = user.user_id
            INNER JOIN account ON account_user.account_id = account.account_id
            WHERE user.primary_user = 'Yes' AND account.account_id = ${customerDetails.account_id} limit 1`;
            const rawResult = await sails.sendNativeQuery(sql);
            let results = rawResult.rows[0] || null;

            if(billing_reason === 'subscription_cycle'){
              const retrieveUpcoming = await stripe.invoices.retrieveUpcoming({ customer: stripeCustomerId});

              const next_payment_date = getTimeStampToDate(retrieveUpcoming.period_end*1000,'YYYY-MM-DD');
              if(customerDetails)
              { sails.log('go inside-->');
                if(results.retry_count >= 2)
                {
                  await Account.update({ account_id: customerDetails.account_id}, {
                    status: 'Payment Declined'
                  }).fetch();
                  await AccountSubscription.update({ stripe_customer_id: stripeCustomerId }, {
                    subscription_status: 'Inactive'});
                } else {
                  await AccountSubscription.update({ stripe_customer_id: stripeCustomerId }, {
                    stripe_latest_invoice_id : invoice.id,
                    free_trial               : 'No',
                    free_trial_days          : 0,
                    next_payment_date        : next_payment_date,
                    expiry_date              : next_payment_date,
                    last_updated_date        : getDateUTC()
                  }).fetch();
                  await Account.update({ account_id: customerDetails.account_id}, {
                    retry_count         : results.retry_count + 1,
                    payment_failed_date : getDateUTC()
                  }).fetch();
                }
                // Whenever first time payment declined, at the time account status is active then only one time paymnet decliend mail send
                // so for at time of retrying payment deduction failed then mail is not send it again to customer.
                if (results.status === 'Active') {
                  const token = await generateString();
                  await AccountSubscription.update({ account_subscription_id: customerDetails.account_subscription_id },{
                    paymentlinktoken: token
                  }).fetch();
                  const queryparam = Buffer.from(
                    `subid=${customerDetails.account_subscription_id}&method=updatestatus&pt=${token}&status=payment_declined`
                  ).toString('base64'); // encode a string
                  const paymentlinkUrl = `${process.env.FRONTEND_BASEURL}/payment?id=${queryparam}`;
                  await sendNotification(req, {
                    notification_entity  : NOTIFICATION_ENTITIES.PAYMENT_DECLINED_CUSTOMER,
                    recipient_email      : results.email,
                    recipient_first_name : results.first_name,
                    recipient_last_name  : results.last_name,
                    receipient_user_id   : results.user_id,
                    currency             : customerDetails.currency,
                    amount               : customerDetails.amount_total,
                    url                  : paymentlinkUrl,
                  });
                }
              }
            } else if (billing_reason === 'subscription_update') {
              const webhooks_delivered_at = invoice.webhooks_delivered_at;
              if (webhooks_delivered_at !== null) {
                const token = await generateString();
                const AccountUpdateSubscriptionDetails = await AccountUpdateSubscription.findOne({ account_subscription_id: customerDetails.account_subscription_id });
                await AccountSubscription.update({ account_subscription_id: customerDetails.account_subscription_id },{
                  paymentlinktoken: token
                }).fetch();
                const queryparam = Buffer.from(
                `subid=${customerDetails.account_subscription_id}&method=updatestatus&pt=${token}&status=payment_declined`
                ).toString('base64'); // encode a string
                const paymentlinkUrl = `${process.env.FRONTEND_BASEURL}/payment?id=${queryparam}`;
                await sendNotification(req, {
                  notification_entity  : NOTIFICATION_ENTITIES.PAYMENT_DECLINED_CUSTOMER,
                  recipient_email      : results.email,
                  recipient_first_name : results.first_name,
                  recipient_last_name  : results.last_name,
                  receipient_user_id   : results.user_id,
                  currency             : customerDetails.currency,
                  amount               : AccountUpdateSubscriptionDetails.amount_total,
                  url                  : paymentlinkUrl,
                });
              }
            }
          }
          break;
        case 'invoice.payment_succeeded':
          sails.log('invoice.payment_succeeded-->');
          const invoiceSucceeded = event.data.object;
          if(invoiceSucceeded)
          {
            if(invoiceSucceeded.billing_reason === 'subscription_cycle'){
              const stripeCustomer_ID = invoiceSucceeded.customer;
              const stripeSubscription_Id = invoiceSucceeded.subscription;
              const retrieveUpcoming = await stripe.invoices.retrieveUpcoming({ customer: stripeCustomer_ID});
              const next_payment_date = getTimeStampToDate(retrieveUpcoming.period_end*1000,'YYYY-MM-DD');
              const stripeCustomerDetail = await getSubscriptionDetailsByStripeId(req,stripeCustomer_ID,stripeSubscription_Id);
              if(stripeCustomerDetail)
              {
                await AccountSubscription.update({ stripe_customer_id: stripeCustomer_ID }, {
                  subscription_status : 'Active',
                  free_trial          : 'No',
                  free_trial_days     : 0,
                  next_payment_date   : next_payment_date,
                  expiry_date         : next_payment_date,
                  last_updated_date   : getDateUTC()
                }).fetch();

                await Account.update({ account_id: stripeCustomerDetail.account_id}, {
                  status              : 'Active',
                  retry_count         : 0,
                  payment_failed_date : null
                }).fetch();
              }
            }

          }
          break;
        case 'customer.subscription.deleted':
          const subscription = event.data.object;
          const stripe_customer_id = subscription.customer;
          const stripe_subscription_id = subscription.id;
          const stripeCustomer = await getSubscriptionDetailsByStripeId(req,stripe_customer_id,stripe_subscription_id);
          if(stripeCustomer)
          {
            await Account.update({ account_id: stripeCustomer.account_id}, {
              status: 'Cancelled'
            }).fetch();
          }
          break;
        case 'product.updated':
          sails.log('product updated-->');
          const product = event.data.object;
          const stripe_product_id = product.id;
          const product_metadata = product.metadata;
          const api_quota = product_metadata.api_quota ? product_metadata.api_quota : 0;
          const api_enabled = (product_metadata.api_enabled && product_metadata.api_enabled === '1') ? API_ENABLED.YES : API_ENABLED.NO;
          let sql = `UPDATE subscription_product SET api_quota='${api_quota}',api_enabled='${api_enabled}' WHERE stripe_product_id='${stripe_product_id}'`;
          await sails.sendNativeQuery(sql);
          await updateAzurepolicy(req,stripe_product_id);
          break;
        default:
          sails.log(`Unhandled event type ${event.type}`);
      }

      return res.ok(undefined, 'Declined Payment', RESPONSE_STATUS.success);
    }
    catch(err)
    {
      sails.log(err);
      return res.ok(undefined, messages.GET_RECORD_FAILURE, RESPONSE_STATUS.error);
    }
  },

  attachPaymentMethod: async(req, res) => {
    try {
      let request = req.allParams();
      const isValid = await PaymentMethodValidation.attachPaymentMethod.validate(request);
      if (!isValid.error) {
        const { payment_method_id, customerId } = req.allParams();
        let userId = '';
        const defaultuser = await Users.findOne({ email: process.env.DEFAULT_ADMIN_USER });
        userId=await userIdData(req,defaultuser);

        const paymentMethodResponse = await stripe.paymentMethods.attach(payment_method_id, {
          customer: customerId,
        });
        const subscriptionDetails = await getSubscriptionDetails(req, customerId);
        let old_stripe_payment_method_id = subscriptionDetails.stripe_payment_method_id;
        let account_id = subscriptionDetails.account_id;

        if(old_stripe_payment_method_id !== undefined && old_stripe_payment_method_id !== null && old_stripe_payment_method_id !== '') {
          try{
            await stripe.paymentMethods.detach(old_stripe_payment_method_id);
            await addAppLog(userId, account_id, customerId, 'attachPaymentMethod - detech old payment method in stripe ', JSON.stringify({'request': ''}), JSON.stringify({'error': ''}), 'success');
          } catch(error){
            await addAppLog(userId, account_id, customerId, 'attachPaymentMethod - detech old payment method in stripe ', JSON.stringify({'request': ''}), JSON.stringify({'error': error}), 'error');
          }
        }

        try{
          await stripe.customers.update(
            customerId,
            {
              invoice_settings: {
                default_payment_method: payment_method_id
              },
              expand: ['sources']
            }
          );
          await addAppLog(userId, account_id, customerId, 'attachPaymentMethod - mark as defualt set payent method ', JSON.stringify({'request': ''}), JSON.stringify({'error': ''}), 'success');
        } catch(error){
          await addAppLog(userId, account_id, customerId, 'attachPaymentMethod - mark as defualt set payent method', JSON.stringify({'request': ''}), JSON.stringify({'error': error}), 'error');
        }

        try{
          await AccountSubscription.update({ stripe_customer_id: customerId },{
            stripe_payment_method_id: paymentMethodResponse.id
          }).fetch();
          await addAppLog(userId, account_id, customerId, 'attachPaymentMethod - update new payment method in database ', JSON.stringify({'request': ''}), JSON.stringify({'error': ''}), 'success');
        } catch(error){
          await addAppLog(userId, account_id, customerId, 'attachPaymentMethod - mark as defualt set payent method', JSON.stringify({'request': ''}), JSON.stringify({'error': error}), 'error');
        }

        return res.ok(undefined, messages.ADD_PAYMENTMETHOD_ATTACH_SUCCESS, RESPONSE_STATUS.success);
      } else {
        res.ok(isValid.error, messages.ADD_PAYMENTMETHOD_ATTACH_FAILURE, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(err.error, err.message, RESPONSE_STATUS.error);
    }
  },

  detachPaymentMethod: async(req, res) => {
    try {
      const paymentMethodId = req.params.id;
      const detachPayment = await stripe.paymentMethods.detach(paymentMethodId);
      if(detachPayment){
        return res.ok(undefined, messages.ADD_PAYMENTMETHOD_DETACH_SUCCESS, RESPONSE_STATUS.success);
      } else {
        res.ok(undefined, messages.ADD_PAYMENTMETHOD_DETACH_FAILURE, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(err.error, err.message, RESPONSE_STATUS.error);
    }
  },

};
