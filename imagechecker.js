'use strict';

const request = require('request');


const imagechecker = (file,callback)=> {
  let subscriptionKey = '9e4ef1014bde4d1db1c936d6df5bbee1';
  let endpoint = 'https://imageanalyzer99.cognitiveservices.azure.com/';

  var uriBase = endpoint + 'vision/v3.1/analyze';

  const imageUrl =file;

// Request parameters.
  const params = {
    'visualFeatures': 'Adult,Brands,Objects,Faces',
    'details': '',
    'language': 'en'
  };
  const options = {
      uri: uriBase,
      qs: params,
    body: '{"url": ' + '"' + imageUrl + '"}',
    headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key' : subscriptionKey
    }
};
request.post(options, (error, response, body) => {

  if (error) {
    console.log('Error: ', error);
    return callback(error,undefined);
  }
  let jsonResponse = JSON.parse(body);
  return callback(undefined,jsonResponse)
});
}


module.exports={imagechecker}