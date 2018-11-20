/*
 * PIZZA Shop WEB APP handlers
 *
 * Create handlers for WEB APP
 *
*/

// Dependencies
var _templates = require('./_templates');
var util = require('util');
var debugModule = util.debuglog('webapp');

// Container object for module
var handlers = {};

handlers.getIndex = function(callback){
  // Prepare the data for interpolation
  var templateData = {
    'head.title' : 'PIZZA romano - OUR DOUGH IS MADE FRESH DAILY',
    'head.description' : 'Famosi per la Pizza',
    'body.class' : 'index'
  };
  _templates.preparePageWithTemplate('index',templateData,function(statusCode,str,contentType){
    callback(statusCode,str,contentType);
  });
};

handlers.getAccountCreate = function(callback){
  // Prepare the data for interpolation
  var templateData = {
    'head.title' : 'Create an Account',
    'head.description' : 'Signup is easy and only takes a few seconds.',
    'body.class' : 'accountCreate'
  };
  _templates.preparePageWithTemplate('accountCreate',templateData,function(statusCode,str,contentType){
    callback(statusCode,str,contentType);
  });
};

handlers.getAccountEdit = function(callback){
  // Prepare the data for interpolation
  var templateData = {
    'head.title' : 'Account Settings',
    'body.class' : 'accountEdit'
  };
  _templates.preparePageWithTemplate('accountEdit',templateData,function(statusCode,str,contentType){
    callback(statusCode,str,contentType);
  });
};

handlers.getAccountDeleted = function(callback){
  // Prepare the data for interpolation
  var templateData = {
    'head.title' : 'Account Deleted',
    'head.description' : 'Your account has been deleted.',
    'body.class' : 'accountDeleted'
  };
  _templates.preparePageWithTemplate('accountDeleted',templateData,function(statusCode,str,contentType){
    callback(statusCode,str,contentType);
  });
};

handlers.getFavIcon = function(assetName, callback){
  _templates.getStaticAsset(assetName, function(err,data){
    if (!err && data) {
      callback(200, 'favicon');
    }else {
      callback(500);
    }
  });
};

handlers.getStaticAsset = function(assetName, callback){
  _templates.getStaticAsset(assetName, function(err,data){
    if (!err && data) {
      // Determin the content type (default the plain text)
      var contentType = 'plain';
      if (assetName.indexOf('.css') > -1) {
        contentType = 'css';
      }

      if (assetName.indexOf('.png') > -1) {
        contentType = 'png';
      }

      if (assetName.indexOf('.jpg') > -1) {
        contentType = 'jpg';
      }

      if (assetName.indexOf('.ico') > -1) {
        contentType = 'favicon';
      }
      // Callback the data and content-type
      callback(200, data, contentType);
    }else {
      callback(404);
    }
  });
};

// Export the module
module.exports = handlers;
