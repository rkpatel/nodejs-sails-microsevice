const messages = sails.config.globals.messages;
const QuoteValidation = require('../validations/QuoteValidation');
const { getTomorrowDate, getTimeStampToDate, datetoTimestamp } = require('../utils/common/getDateTime');
const { RESPONSE_STATUS } = require('../utils/constants/enums');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const expiresAt=async(quote)=>{
  return quote.expires_at ? getTimeStampToDate(quote.expires_at*1000,'YYYY-MM-DD') : '';
};

module.exports = {
  findbycustomer: async(req, res) =>{
    let request = req.allParams();
    const { customerId, products, coupon } = request;
    const isValidate = await QuoteValidation.getQuote.validate(request);
    if (!isValidate.error) {
      try{
        let product_arr = products.map((products_item) => {
          return {
            price    : products_item.stripe_price_id,
            quantity : products_item.seats
          };
        });
        let quoteData = {};
        if(coupon !== '') {
          const quote = await stripe.quotes.create({
            customer   : customerId,
            expires_at : datetoTimestamp(getTomorrowDate()),
            line_items : product_arr,
            discounts  : [
              {
                coupon: coupon
              },
            ]
          });

          quoteData = {
            amount_subtotal : quote.amount_subtotal/100,
            amount_total    : quote.amount_total/100,
            interval        : quote.computed.recurring.interval,
            currency        : quote.currency,
            expires_at      : await expiresAt(quote)
          };
        } else {
          const quote = await stripe.quotes.create({
            customer   : customerId,
            expires_at : datetoTimestamp(getTomorrowDate()),
            line_items : product_arr,
          });

          quoteData = {
            amount_subtotal : quote.amount_subtotal/100,
            amount_total    : quote.amount_total/100,
            interval        : quote.computed.recurring.interval,
            currency        : quote.currency,
            expires_at      : await expiresAt(quote)
          };
        }

        return res.ok(
          quoteData,
          messages.QUOTE_GET_SUCCESSFULL,
          RESPONSE_STATUS.success);
      }catch (err) {
        sails.log.error(err);
        return res.ok(
        undefined,
        messages.SOMETHING_WENT_WRONG,
        RESPONSE_STATUS.error
        );
      }
    } else {
      res.ok(
        isValidate.error,
        messages.ADD_REPORT_FAILURE,
        RESPONSE_STATUS.error
      );
    }
  },
};
