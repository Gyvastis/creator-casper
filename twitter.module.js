var require = patchRequire(require);

var domain = "https://www.twitter.com/";
var domain_app = "https://apps.twitter.com/";

exports.getMainUrl = function(){
  return domain;
};

exports.getAppUrl = function(){
  return domain_app;
};

exports.login = function() {

  var casper = require('casper').create({
      pageSettings: {
          //loadImages:  false,
          //loadPlugins: false
      },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
      viewportSize: {
          width: 1600,
          height: 900
      },
      //clientScripts: ["jquery-1.11.3.min.js"]
  });

  casper.start();

  var email     = casper.cli.get(0);
  var username  = casper.cli.get(1);
  var password  = casper.cli.get(2);
  var phone     = casper.cli.get(3);

  casper.thenOpen(domain + 'login', function () {
      this.fill('form.signin', {
          'session[username_or_email]': username,
          'session[password]': password
      }, true);
  });

  casper.then(function(){
    if(this.getCurrentUrl().indexOf("login_challenge") > 0){
      var challenge_text = '';

      if(this.getCurrentUrl().indexOf("challenge_type=RetypeEmail") > 0){
          this.echo('Entering EMAIL challenge...');
          challenge_text = email;
      }
      else{
          this.echo('Entering PHONE challenge...');
          challenge_text = phone;
      }

      casper.waitForSelector('#login-challenge-form', function(){
        this.fill('#login-challenge-form', {
            'challenge_response': challenge_text
        }, true);
      });
    }

    this.echo('Logged in ('+username+')...');
  });

  return casper;
};
