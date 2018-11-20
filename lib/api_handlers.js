/*
 * PIZZA Shop rest API
 *
 * Create handlers for App API
 *
*/

// Dependencies
var _app = require('./app_handlers');
var _users = require('./user_handlers');
var _tokens = require('./token_handlers');
var _offers = require('./offer_handlers');
var _shopping = require('./shopping_handlers');
var _checkout = require('./checkout_handlers');

// Container object for module
var handlers = {};

// Web app handlers
// index handler
handlers.index = function(data, callback){
  if (data.method == 'get') {
    _app.getIndex(function(statusCode,str,contentType){
      callback(statusCode,str,contentType);
    });
  } else {
    callback(405, undefined, 'html');
  }
};

// Favicon handler
handlers.favIcon = function(data, callback){
  if (data.method == 'get') {
    _app.getFavIcon('favicon.ico', function(statusCode,str,contentType){
      callback(statusCode,str,contentType);
    });
  } else {
    callback(405);
  }
};

// Public assets handler
handlers.public = function(data, callback){
  if (data.method == 'get') {
    // Get the filename being requested
    var trimmedAssetName = data.handlerPath.replace('public/', '').trim();
    if (trimmedAssetName.length > 0) {
      _app.getStaticAsset(trimmedAssetName, function(statusCode,str,contentType){
        callback(statusCode,str,contentType);
      });
    } else {
      callback(404);
    }
  } else {
    callback(405);
  }
};


// API JSON handlers

// Ping handler
handlers.ping = function(data, callback){
    // Callback a http status code, and a payload object
    callback(200);
};

// Not found handler
handlers.notFound = function(data, callback){
    callback(404);
};

handlers.users = function(data, callback){
    var acceptableMethods = ['post','get','put','delete'];

    if (acceptableMethods.indexOf(data.method) > -1){
        _users[data.method](data, callback);
    } else {
        callback(405);
    }

};

handlers.tokens = function(data, callback){
    var acceptableMethods = ['post','get','put','delete'];

    if (acceptableMethods.indexOf(data.method) > -1){
        _tokens[data.method](data, callback);
    } else {
        callback(405);
    }

};

handlers.login = function(data, callback){
    var acceptableMethods = ['post','put'];

    if (acceptableMethods.indexOf(data.method) > -1){
        _tokens[data.method](data, callback);
    } else {
        callback(405);
    }

};

handlers.logout = function(data, callback){
    var acceptableMethods = ['delete'];

    if (acceptableMethods.indexOf(data.method) > -1){
        _tokens[data.method](data, callback);
    } else {
       callback(405);
    }

};

handlers.offer = function(data, callback){
    var acceptableMethods = ['get'];

    if (acceptableMethods.indexOf(data.method) > -1){
        _offers[data.method](data, callback);
    } else {
       callback(405);
    }

};

handlers.shopping = function(data, callback){
    var acceptableMethods = ['post','get','delete'];

    if (acceptableMethods.indexOf(data.method) > -1){
        _shopping[data.method](data, callback);
    } else {
       callback(405);
    }

};

handlers.checkout = function(data, callback){
    var acceptableMethods = ['post'];

    if (acceptableMethods.indexOf(data.method) > -1){
        _checkout[data.method](data, callback);
    } else {
       callback(405);
    }

};

// Export the module
module.exports = handlers;
