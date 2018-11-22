/*
 * Frontend Logic for application
 *
 */

// Container for frontend application
var app = {};

// Config
app.config = {
  'sessionToken' : false
};

// Helpers functions for client
app.lib = {};

app.lib.getValidObjectOrDefault = function(data, defaultData) {
    return typeof(data) == 'object' && data !==null ? data : defaultData;
};

app.lib.getValidMethodOrDefault = function(data, defaultData) {
    return typeof(data) == 'string'  && ['POST','GET','PUT','DELETE'].indexOf(data.toUpperCase()) > -1 ? data.toUpperCase() : defaultData;
};

app.lib.getValidStringOrDefault = function(data, defaultData) {
    return typeof(data) == 'string' ? data : defaultData;
};

app.lib.getValidCallbackOrFalse = function(callback) {
    return typeof(callback) == 'function' ? callback : false;
};

app.lib.getNonEmptyStringOrEmpty = function(str) {
    return typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : '';
};

app.lib.getValidArrayOrEmpty = function(data) {
    return typeof(data) == 'object' && data instanceof Array  ? data : [];
};

app.lib.getValidJsonOrFalse = function(payload) {
  var parsedResponse = false;
  try{
    parsedResponse = JSON.parse(payload);
  } catch(e){
    return false;
  }
  return parsedResponse;
};

app.lib.getValueOfElement = function(element, payloadValue){
  // Determine class of element and set value accordingly
  var classOfElement = app.lib.getNonEmptyStringOrEmpty(element.classList.value);

  var valueOfElement = element.value;
  if (element.type == 'checkbox' && classOfElement.indexOf('multiselect') == -1) {
    valueOfElement = element.checked;
  }else {
    if (classOfElement.indexOf('intval') == -1) {
      valueOfElement = element.value;
    }else {
      valueOfElement = parseInt(element.value);
    }
  }
  var elementIsChecked = element.checked;

  var payloadReturn = payloadValue;
  // If the element has the class "multiselect" add its value(s) as array elements
  if(classOfElement.indexOf('multiselect') > -1){
    if(elementIsChecked){
      payloadReturn = app.lib.getValidArrayOrEmpty(payloadValue);
      payloadReturn.push(valueOfElement);
    }
  } else {
    payloadReturn = valueOfElement;
  }
  return payloadReturn;
};

app.catalog = {};

// Get all articles from catalog offer
app.catalog.loadAllArticles = function(callback){
  var queryStringObject = {
  };
  app.client.request(undefined,'api/offer','GET',queryStringObject,undefined,function(statusCode,responsePayload){
    if(statusCode == 200){
      // Determine how many Catalog Itemss exist
      var catalogItems = app.lib.getValidArrayOrEmpty(responsePayload);
      callback(catalogItems);
    } else {
      callback(false);
    }
  });
};

app.account = {};

// Log the user out then redirect them
app.account.logUserOut = function(redirectUser){
  // Set redirectUser to default to true
  redirectUser = typeof(redirectUser) == 'boolean' ? redirectUser : true;

  // Get the current token id
  var tokenId = app.lib.getValidStringOrDefault(app.config.sessionToken.id, false);

  // Send the current token to the tokens endpoint to delete it
  var queryStringObject = {
    'id' : tokenId
  };
  app.client.request(undefined,'api/tokens','DELETE',queryStringObject,undefined,function(statusCode,responsePayload){
    // Set the app.config token as false
    app.tokens.setSessionToken(false);

    // Send the user to the logged out page
    if(redirectUser){
      window.location = '/session/deleted';
    }

  });
};

app.tokens = {};

// Get the session token from localstorage and set it in the app.config object
app.tokens.getSessionToken = function(){
  var tokenString = app.lib.getValidStringOrDefault(localStorage.getItem('token'), false);
  if(tokenString){
    try{
      var token = JSON.parse(tokenString);
      app.config.sessionToken = token;
      if(typeof(token) == 'object'){
        app.setLoggedInClass(true);
      } else {
        app.setLoggedInClass(false);
      }
    }catch(e){
      app.config.sessionToken = false;
      app.setLoggedInClass(false);
    }
  }
};

// Set the session token in the app.config object as well as localstorage
app.tokens.setSessionToken = function(token){
  app.config.sessionToken = token;
  var tokenString = JSON.stringify(token);
  localStorage.setItem('token',tokenString);
  if(typeof(token) == 'object'){
    app.setLoggedInClass(true);
  } else {
    app.setLoggedInClass(false);
  }
};

// Renew the token
app.tokens.renewToken = function(callback){
  var currentToken = app.lib.getValidObjectOrDefault(app.config.sessionToken, false);
  if(currentToken){
    // Update the token with a new expiration
    var payload = {
      'id' : currentToken.id,
      'extend' : true,
    };
    app.client.request(undefined,'api/tokens','PUT',undefined,payload,function(statusCode,responsePayload){
      // Display an error on the form if needed
      if(statusCode == 200){
        // Get the new token details
        var queryStringObject = {'id' : currentToken.id};
        app.client.request(undefined,'api/tokens','GET',queryStringObject,undefined,function(statusCode,responsePayload){
          // Display an error on the form if needed
          if(statusCode == 200){
            app.tokens.setSessionToken(responsePayload);
            callback(false);
          } else {
            app.tokens.setSessionToken(false);
            callback(true);
          }
        });
      } else {
        app.tokens.setSessionToken(false);
        callback(true);
      }
    });
  } else {
    app.tokens.setSessionToken(false);
    callback(true);
  }
};

app.forms = {};

// Load the account edit page specifically
app.forms.loadAccountEditPage = function(){
  // Get the phone number from the current token, or log the user out if none is there
  var email = app.lib.getValidStringOrDefault(app.config.sessionToken.email, false);
  if(email){
    // Fetch the user data
    var queryStringObject = {
      'email' : email
    };
    app.client.request(undefined,'api/users','GET',queryStringObject,undefined,function(statusCode,responsePayload){
      if(statusCode == 200){
        // Put the data into the forms as values where needed
        document.querySelector("#accountEdit1 .fullNameInput").value = responsePayload.fullName;
        document.querySelector("#accountEdit1 .displayEmailInput").value = responsePayload.email;

        // Put the hidden phone field into both forms
        var hiddenPhoneInputs = document.querySelectorAll("input.hiddenEmailAddressInput");
        for(var i = 0; i < hiddenPhoneInputs.length; i++){
            hiddenPhoneInputs[i].value = responsePayload.email;
        }

      } else {
        // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
        app.account.logUserOut();
      }
    });
  } else {
    app.account.logUserOut();
  }
};

// Load the catalog page specifically
app.forms.loadCatalogListPage = function(){
  // Get the phone number from the current token, or log the user out if none is there
  var email = app.lib.getValidStringOrDefault(app.config.sessionToken.email, false);
  if(email){
    // Fetch the user data
    var queryStringObject = {
      'email' : email
    };
    app.catalog.loadAllArticles(function(catalogItems){
      if(catalogItems){
        // Determine how many Catalog Itemss exist
        if(catalogItems.length > 0){

          var table = document.getElementById("catalogListTable");
          var catalogIndex = 0;
          // Show each created Cart Itemss as a new row in the table
          catalogItems.forEach(function(article){
            var tr = table.insertRow(-1);
            tr.classList.add('catalogItemRow');
            var td0 = tr.insertCell(0);
            var td1 = tr.insertCell(1);
            var td2 = tr.insertCell(2);
            var td3 = tr.insertCell(3);
            var td4 = tr.insertCell(4);
            td0.innerHTML = article.id;
            td0.classList.add('rowArticleId');
            td1.innerHTML = article.name;
            td2.innerHTML = article.mixtureEnglish + '<br><br>' + article.mixtureCzech;
            td3.innerHTML = article.price + ' USD';
            td3.classList.add('tableCellPrice');
            if (article.id < 500){
              td4.innerHTML = '<img class="sampleImage" src="public/samplePizza.png" alt="'+article.name+'" />';
            }else {
              td4.innerHTML = '<img class="sampleImage" src="public/sampleSweet.png" alt="'+article.name+'" />';
            }
            td4.classList.add('rowDetails');

            catalogIndex++;
          });

          document.getElementById("gotoCartCTA").style.display = 'block';
        } else {
          // Show 'you have no Carts' message
          document.getElementById("noCatalogMessage").style.display = 'table-row';
        }
      } else {
        window.location = '/cart/all';
      }
    });
  } else {
    window.location = '/cart/all';
  }
};

// Load the shopping cart page specifically
app.forms.loadCartListPage = function(){
  // Get the phone number from the current token, or log the user out if none is there
  var email = app.lib.getValidStringOrDefault(app.config.sessionToken.email, false);
  if(email){
    // Fetch the user data
    var queryStringObject = {
      'email' : email
    };
    app.client.request(undefined,'api/shopping','GET',queryStringObject,undefined,function(statusCode,responsePayload){
      if(statusCode == 200){

        // Determine how many Cart Itemss the user has
        var objCartTotal = app.lib.getValidObjectOrDefault(responsePayload);
        var allCartItems = app.lib.getValidArrayOrEmpty(objCartTotal.cartItems);
        if(allCartItems.length > 0){

          var table = document.getElementById("cartListTable");
          var cartItemIndex = 0;
          // Show each created Cart Itemss as a new row in the table
          allCartItems.forEach(function(cartItem){
            // Get the data for the article
            // Make the Cart Items data into a table row
            var tr = table.insertRow(-1);
            tr.classList.add('cartItemRow');
            var td0 = tr.insertCell(0);
            var td1 = tr.insertCell(1);
            var td2 = tr.insertCell(2);
            var td3 = tr.insertCell(3);
            var td4 = tr.insertCell(4);
            td0.innerHTML = cartItem.id;
            td0.classList.add('rowArticleId');
            td1.innerHTML = cartItem.name;
            td2.innerHTML = cartItem.mixtureEnglish + '<br><br>' + cartItem.mixtureCzech;
            td3.innerHTML = cartItem.price;
            td3.classList.add('tableCellPrice');
            td4.innerHTML = '<a href="/cart/edit?index='+cartItemIndex+'">View / Edit / Delete</a>';
            td4.classList.add('rowDetails');

            cartItemIndex++;
          });
          var tr = table.insertRow(-1);
          tr.id = 'totalMessage';
          var td0 = tr.insertCell(0);
          var td1 = tr.insertCell(1);
          var td2 = tr.insertCell(2);
          var td3 = tr.insertCell(3);
          var td4 = tr.insertCell(4);
          td0.innerHTML = 'Total';
          td1.innerHTML = objCartTotal.totalCount;
          td1.id = 'totalMessageCount';
          td2.innerHTML = 'Total price';
          td3.innerHTML = objCartTotal.totalPrice;
          td3.id = 'totalMessagePrice';
          td4.innerHTML = '';

          if(allCartItems.length < 5){
            // Show the createCart CTA
            document.getElementById("createCartCTA").style.display = 'block';
          }
          // Show the ceckoutCart CTA
          document.getElementById("checkoutCartCTA").style.display = 'block';

          // Show 'you have no Carts' message
          document.getElementById("totalMessage").style.display = 'table-row';
        } else {
          // Show 'you have no Carts' message
          document.getElementById("noCartMessage").style.display = 'table-row';

          // Show the createCart CTA
          document.getElementById("createCartCTA").style.display = 'block';
        }
      } else {
        // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
        app.account.logUserOut();
      }
    });
  } else {
    app.account.logUserOut();
  }
};

app.forms.loadCartAddPage = function(){
  // Get the phone number from the current token, or log the user out if none is there
  var email = app.lib.getValidStringOrDefault(app.config.sessionToken.email, false);
  if(email){
    // Fetch the catalog data
    app.catalog.loadAllArticles(function(catalogItems){
      if(catalogItems){
        // Determine how many Catalog Itemss exist
        if(catalogItems.length > 0){

          var catalogIndex = 0;
          // Show each created Cart Itemss as a new row in the table
          catalogItems.forEach(function(article){
            var optionSelect = document.getElementById("articleSelect");
            var option = document.createElement('option');
            option.value = article.id;
            option.innerHTML = article.name + ' (' + article.price + ' USD)';
            optionSelect.appendChild(option);
            catalogIndex++;
          });
        }
        // Put the hidden Email Address field into both forms
        var hiddenEmailAddressInputs = document.querySelectorAll("input.hiddenEmailAddressInput");
        for(var i = 0; i < hiddenEmailAddressInputs.length; i++){
            hiddenEmailAddressInputs[i].value = email;
        }
      } else {
        // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
        app.account.logUserOut();
      }
    });
  } else {
    app.account.logUserOut();
  }
}

app.forms.loadCartEditPage = function(){
  var refIndex = window.location.href.split('=')[1];
  var index = app.lib.getValidStringOrDefault(refIndex, false);
  var email = app.lib.getValidStringOrDefault(app.config.sessionToken.email, false);

  if(index && email){
    // Fetch the user data
    var queryStringObject = {
      'email' : email
    };
    app.client.request(undefined,'api/shopping','GET',queryStringObject,undefined,function(statusCode,responsePayload){
      if(statusCode == 200){
        var allCartItems = app.lib.getValidArrayOrEmpty(responsePayload.cartItems);
        var cartItem = (allCartItems.length > index) ? allCartItems[index] : false;
        if (cartItem) {
          // Fetch the catalog data
          app.catalog.loadAllArticles(function(catalogItems){
            if(catalogItems){
              // Determine how many Catalog Itemss exist
              if(catalogItems.length > 0){

                var catalogIndex = 0;
                // Show each created Cart Itemss as a new row in the table
                catalogItems.forEach(function(article){
                  var optionSelect = document.getElementById("articleSelect");
                  var option = document.createElement('option');
                  option.value = article.id;
                  option.innerHTML = article.name + ' (' + article.price + ' USD)';
                  optionSelect.appendChild(option);
                  if (cartItem.id==article.id){
                    optionSelect.selectedIndex = catalogIndex;
                  }
                  catalogIndex++;
                });
              }
              // Put the hidden Email Address field into both forms
              var hiddenEmailAddressInputs = document.querySelectorAll("input.hiddenEmailAddressInput");
              for(var i = 0; i < hiddenEmailAddressInputs.length; i++){
                hiddenEmailAddressInputs[i].value = email;
              }
              var hiddenCartLineIndexInputs = document.querySelectorAll("input.hiddenCartLineIndexInput");
              for(var i = 0; i < hiddenCartLineIndexInputs.length; i++){
                hiddenCartLineIndexInputs[i].value = index;
              }
            } else {
              window.location = '/cart/all';
            }
          });
        } else {
          window.location = '/cart/all';
        }
      } else {
        window.location = '/cart/all';
      }
    });
  } else {
    window.location = '/cart/all';
  }
}

app.forms.loadCartCheckoutPage = function(){
  var email = app.lib.getValidStringOrDefault(app.config.sessionToken.email, false);

  if(email){
    // Fetch the user data
    var queryStringObject = {
      'email' : email
    };
    app.client.request(undefined,'api/shopping','GET',queryStringObject,undefined,function(statusCode,responsePayload){
      if(statusCode == 200){
        var cartTotals = app.lib.getValidObjectOrDefault(responsePayload, false);
        if (cartTotals) {
          var hiddenPhoneInputs = document.querySelectorAll("input.hiddenEmailAddressInput");
          for(var i = 0; i < hiddenPhoneInputs.length; i++){
              hiddenPhoneInputs[i].value = email;
          }
          document.querySelector("#cartCheckout .displayTotalCountInput").value = cartTotals.totalCount;
          document.querySelector("#cartCheckout .displayTotalPriceInput").value = cartTotals.totalPrice;
        } else {
          window.location = '/cart/all';
        }
      } else {
        window.location = '/cart/all';
      }
    });
  } else {
    window.location = '/cart/all';
  }
}

// AJAX Client (for RESTful API)
app.client = {};

// Interface for making API calls
app.client.request = function(headers,path,method,queryStringObject,payload,callback){

  // Set defaults
  headers = app.lib.getValidObjectOrDefault(headers, {});
  path = app.lib.getValidStringOrDefault(path, '/');
  method = app.lib.getValidMethodOrDefault(method, 'GET');
  queryStringObject = app.lib.getValidObjectOrDefault(queryStringObject, {});
  payload = app.lib.getValidObjectOrDefault(payload, {});
  callback = app.lib.getValidCallbackOrFalse(callback);

  // For each query string parameter sent, add it to the path
  var requestUrl = path+'?';
  var counter = 0;
  for(var queryKey in queryStringObject){
     if(queryStringObject.hasOwnProperty(queryKey)){
       counter++;
       // If at least one query string parameter has already been added, preprend new ones with an ampersand
       if(counter > 1){
         requestUrl+='&';
       }
       // Add the key and value
       requestUrl+=queryKey+'='+queryStringObject[queryKey];
     }
  }

  // Form the http request as a JSON type
  var xhr = new XMLHttpRequest();
  xhr.open(method, requestUrl, true);
  xhr.setRequestHeader("Content-type", "application/json");

  // For each header sent, add it to the request
  for(var headerKey in headers){
     if(headers.hasOwnProperty(headerKey)){
       xhr.setRequestHeader(headerKey, headers[headerKey]);
     }
  }

  // If there is a current session token set, add that as a header
  if(app.config.sessionToken){
    xhr.setRequestHeader("token", app.config.sessionToken.id);
  }

  // When the request comes back, handle the response
  xhr.onreadystatechange = function() {
      if(xhr.readyState == XMLHttpRequest.DONE) {
        var statusCode = xhr.status;
        var responseReturned = xhr.responseText;

        // Callback if requested
        if(callback != null){
          var parsedResponse = app.lib.getValidJsonOrFalse(responseReturned);

          callback(statusCode,parsedResponse);
        }
      }
  }

  // Send the payload as JSON
  var payloadString = JSON.stringify(payload);
  xhr.send(payloadString);

};

// Set (or remove) the loggedIn class from the body
app.setLoggedInClass = function(add){
  var target = document.querySelector("body");
  if(add){
    target.classList.add('loggedIn');
  } else {
    target.classList.remove('loggedIn');
  }
};

// Bind the logout button
app.bindLogoutButton = function(){
  document.getElementById("logoutButton").addEventListener("click", function(e){

    // Stop it from redirecting anywhere
    e.preventDefault();

    // Log the user out
    app.account.logUserOut();

  });
};

// Bind the forms
app.bindForms = function(){
  if(document.querySelector("form")){

    var allForms = document.querySelectorAll("form");

    for(var i = 0; i < allForms.length; i++){
      allForms[i].addEventListener("submit", function(e){

        // Stop it from submitting
        e.preventDefault();
        var formId = this.id;
        var path = this.action;
        var method = this.method.toUpperCase();

        // Hide the error message (if it's currently shown due to a previous error)
        document.querySelector("#"+formId+" .formError").style.display = 'none';

        // Hide the success message (if it's currently shown due to a previous error)
        if(document.querySelector("#"+formId+" .formSuccess")){
          document.querySelector("#"+formId+" .formSuccess").style.display = 'none';
        }
        // Hide the success message (if it's currently shown due to a previous error)
        if(document.querySelector("#"+formId+" .formDelayedSuccess")){
          document.querySelector("#"+formId+" .formDelayedSuccess").style.display = 'none';
        }

        // Turn the inputs into a payload
        var payload = {};
        var elements = this.elements;
        for(var i = 0; i < elements.length; i++){

          if(elements[i].type !== 'submit'){
            var nameOfElement = elements[i].name;
            var valueOfElement = elements[i].value;

            // Override the method of the form if the input's name is _method
            if(nameOfElement == '_method'){
              method = valueOfElement;
            } else {
              // Create an payload field named "method" if the elements name is actually httpmethod
              if(nameOfElement == 'httpmethod'){
                nameOfElement = 'method';
              }
              // Create an payload field named "id" if the elements name is actually uid
              if(nameOfElement == 'uid'){
                nameOfElement = 'id';
              }
              if(nameOfElement == 'article'){
                nameOfElement = 'id';
              }

              payload[nameOfElement] = app.lib.getValueOfElement(elements[i], payload[nameOfElement]);
            }
          }
        }

        console.log ('PAYLOAD REQ: ', payload);

        // If the method is DELETE, the payload should be a queryStringObject instead
        var queryStringObject = method == 'DELETE' ? payload : {};

        // Call the API
        app.client.request(undefined,path,method,queryStringObject,payload,function(statusCode,responsePayload){
          // Display an error on the form if needed
          if(statusCode !== 200){

            if(statusCode == 403){
              // log the user out
              app.account.logUserOut();

            } else {

              // Try to get the error from the api, or set a default error message
              var error = app.lib.getValidStringOrDefault(responsePayload.Error, 'An error has occured, please try again');

              // Set the formError field with the error text
              document.querySelector("#"+formId+" .formError").innerHTML = error;

              // Show (unhide) the form error field on the form
              document.querySelector("#"+formId+" .formError").style.display = 'block';
            }
          } else {
            // If successful, send to form response processor
            app.formResponseProcessor(formId,payload,responsePayload);
          }
        });
      });
    }
  }
};

// Form response processor
app.formResponseProcessor = function(formId,requestPayload,responsePayload){
  var functionToCall = false;
  // If account creation was successful, try to immediately log the user in
  if(formId == 'accountCreate'){
    // Take the phone and password, and use it to log the user in
    var newPayload = {
      'email' : requestPayload.email,
      'password' : requestPayload.password
    };

    app.client.request(undefined,'api/tokens','POST',undefined,newPayload,function(newStatusCode,newResponsePayload){
      // Display an error on the form if needed
      if(newStatusCode !== 200){

        // Set the formError field with the error text
        document.querySelector("#"+formId+" .formError").innerHTML = 'Sorry, an error has occured. Please try again.';

        // Show (unhide) the form error field on the form
        document.querySelector("#"+formId+" .formError").style.display = 'block';

      } else {
        // If successful, set the token and redirect the user
        app.tokens.setSessionToken(newResponsePayload);
        window.location = '/cart/all';
      }
    });
  }
  // If login was successful, set the token in localstorage and redirect the user
  if(formId == 'sessionCreate'){
    app.tokens.setSessionToken(responsePayload);
    window.location = '/cart/all';
  }

  // If forms saved successfully and they have success messages, show them
  var formsWithSuccessMessages = ['accountEdit1', 'accountEdit2','cartEdit1'];
  if(formsWithSuccessMessages.indexOf(formId) > -1){
    document.querySelector("#"+formId+" .formSuccess").style.display = 'block';
  }

  var formsWithDelayedSuccessMessages = ['cartCheckout'];
  if(formsWithDelayedSuccessMessages.indexOf(formId) > -1){
    document.querySelector("#"+formId+" .formDelayedSuccess").style.display = 'block';
  }
  // If the user just deleted their account, redirect them to the account-delete page
  if(formId == 'accountEdit3'){
    app.account.logUserOut(false);
    window.location = '/account/deleted';
  }

  // If the user just created a new Cart successfully, redirect back to the dashboard
  if(formId == 'cartAdd'){
    window.location = '/cart/all';
  }

  // If the user just deleted a Cart, redirect them to the dashboard
  if(formId == 'cartEdit2'){
    window.location = '/cart/all';
  }

  // If the user just deleted a Cart, redirect them to the dashboard
  if(formId == 'cartCheckout'){
    setTimeout(function () {
      //will redirect to cart list page
      window.location = '/cart/all';
    }, 5000); //will call the function after 5 secs.
  }
};

// Load data on the page
app.loadDataOnPage = function(){
  // Get the current page from the body class
  var bodyClasses = document.querySelector("body").classList;
  var primaryClass = app.lib.getValidStringOrDefault(bodyClasses[0], false);

  // Logic for account settings page
  if(primaryClass == 'accountEdit'){
    app.forms.loadAccountEditPage();
  }

  // Logic for catalog page
  if(primaryClass == 'catalogList'){
    app.forms.loadCatalogListPage();
  }

  // Logic for shopping cart page
  if(primaryClass == 'cartList'){
    app.forms.loadCartListPage();
  }
  // Logic for Cart details page
  if(primaryClass == 'cartAdd'){
    app.forms.loadCartAddPage();
  }
  // Logic for Cart details page
  if(primaryClass == 'cartEdit'){
    app.forms.loadCartEditPage();
  }
  // Logic for Cart checkout page
  if(primaryClass == 'cartCheckout'){
    app.forms.loadCartCheckoutPage();
  }
};

// Loop to renew token often
app.tokenRenewalLoop = function(){
  setInterval(function(){
    app.tokens.renewToken(function(err){
      if(!err){
        console.log("Token renewed successfully @ "+Date.now());
      }
    });
  },1000 * 60);
};

// Init (bootstrapping)
app.init = function(){
  // Bind all form submissions
  app.bindForms();

  // Bind logout logout button
  app.bindLogoutButton();

  // Get the token from localstorage
  app.tokens.getSessionToken();

  // Renew token
  app.tokenRenewalLoop();

  // Load data on page
  app.loadDataOnPage();

};

// Call the init processes after the window loads
window.onload = function(){
  app.init();
};
