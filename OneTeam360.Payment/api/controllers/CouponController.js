const messages = sails.config.globals.messages;
const { RESPONSE_STATUS } = require('../utils/constants/enums');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = {
  list: async(req, res) =>{
    sails.log(req.allParams());
    try{
      const coupons = await stripe.coupons.list({});
      const couponsData = coupons.data;
      let couponArr = [];
      if (couponsData) {
        for (const data of couponsData) {
          couponArr.push({
            id   : data.id,
            name : data.name,
          });
        }
      }
      return res.ok(
        couponArr,
        messages.COUPON_GET_SUCCESSFULL,
        RESPONSE_STATUS.success);
    }catch (err) {
      sails.log.error(err);
      return res.ok(
      undefined,
      messages.SOMETHING_WENT_WRONG,
      RESPONSE_STATUS.error
      );
    }
  },
};
