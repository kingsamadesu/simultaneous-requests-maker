const { json } = require('express');
const Joi = require('joi');

module.exports = {

  // Post /syncRequests
  listRequests: {
    body: {
      requests: Joi.array().items(Joi.object({
        url: Joi.string().uri().required(),
        method: Joi.string().valid(['POST', 'GET', 'PUT', 'DELETE', 'PATCH']).default('GET').required(),
        headers: Joi.object(),
        data: Joi.string().when('method', {
          is: Joi.valid(['POST', 'PATCH', 'PUT']),
          otherwise: Joi.string().forbidden(),
          then: Joi.string().required()
        }),
      }).required())
    },
  },
};
