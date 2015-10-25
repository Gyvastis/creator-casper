var require = patchRequire(require);
var casper = null;

var domainMain = "https://www.twitter.com/";
var domainApp = "https://apps.twitter.com/";

exports.create = function(casperOptions){
  return new TwitterAppControl(casperOptions);
};

var TwitterAppControl = function TwitterAppControl(casperOptions){
  casper = require('casper').create(casperOptions).start();
  this.credentials = null;
};

TwitterAppControl.prototype.login = function login() {
  var credentials = {
    'email': casper.cli.get(0),
    'username': casper.cli.get(1),
    'password': casper.cli.get(2),
    'phone': casper.cli.get(3)
  };
  this.credentials = credentials;

  //fix me: check if credentials are set

  casper.thenOpen(domainMain + 'login', function () {
    this.echo('Logging in...');

    this.fill('form.signin', {
        'session[username_or_email]': credentials.username,
        'session[password]': credentials.password
    }, true);
  });

  casper.then(function(){
    if(this.getCurrentUrl().indexOf("login_challenge") > 0){
      var challenge_text = 'Entering {0} challenge...';
      var challenge_response = null;

      if(this.getCurrentUrl().indexOf("challenge_type=RetypeEmail") > 0){
          this.echo(challenge_text.format('EMAIL'));
          challenge_response = credentials.email;
      }
      else{
          this.echo(challenge_text.format('PHONE'));
          challenge_response = credentials.phone;
      }

      casper.waitForSelector('#login-challenge-form', function(){
        this.fill('#login-challenge-form', {
            'challenge_response': challenge_response
        }, true);
      });
    }

    this.echo('Logged in ('+credentials.username+')...');
  });

  return this;
};

TwitterAppControl.prototype.createApp = function create(){
  casper.then(function(app_url, main_url){
      var  = this.evaluate(function(){
          return $('.content .account-group').attr('data-screen-name');
      });

      var app_name =  + Math.floor((Math.random() * 100) + 1).toString() + ' test';

      casper.thenOpen(app_url + '/app/new', function(){
          casper.waitForSelector('#edit-tos-agreement', function(){
              this.click('#edit-tos-agreement');

              this.fill('form#twitter-apps-create-form', {
                  name: app_name,
                  description: 'Test application',
                  url: main_url
              }, true);

              this.click('#edit-submit');
          }, function(){
        	    this.echo('App create form not found');
        	});
      });

      casper.waitFor(function(){
          return this.getTitle().indexOf(app_name) >= 0
      }, function(){
          this.echo('App created!');

          casper.thenOpen(app_url, function(){
              var current_app_url = this.evaluate(function(){
                  return $('.app-details a').attr('href').replace('/show', '/keys');
              });

              casper.thenOpen(app_url + current_app_url, function(){
                casper.waitForSelector('#edit-submit-owner-token', function(){
                    this.click('#edit-submit-owner-token');
                }, function(){
                    this.echo('Token submit button not found');

                    this.exit();
                });
              });
          });
      }, function(){
          this.echo('Failed to create app');
          this.capture('test.png');

          this.exit();
      });

      casper.waitForSelector('.access', function(){
          this.echo();

          var access_token = this.evaluate(function(){
              return $('.access .row span:nth-child(2)').get(0).innerText;
          });
          this.echo(access_token);

          var access_token_secret = this.evaluate(function(){
              return $('.access .row span:nth-child(2)').get(1).innerText;
          });
          this.echo(access_token_secret);

          var consumer_key = this.evaluate(function(){
              return $('.app-settings .row span:nth-child(2)').get(0).innerText;
          });
          this.echo(consumer_key);

          var consumer_key_secret = this.evaluate(function(){
              return $('.app-settings .row span:nth-child(2)').get(1).innerText;
          });
          this.echo(consumer_key_secret);
      });
  }, this.getAppUrl(), this.getMainUrl);

  return this;
};

twitterAppControl.prototype.deleteApps() = function deleteApps(){
  casper.thenOpen(this.getAppUrl(), function(app_url){
      this.echo('Checking apps...');

      apps = this.evaluate(function(){
         return $('.twitter-app .app-details a').map(function(){ return this.getAttribute('href'); }).get();
      });

      this.echo(JSON.stringify(apps));

      for(var i = 0; i < apps.length; i++){

        casper.thenOpen(app_url + apps[i].replace('/show', '/delete'), function(){

          this.echo('Deleting app... ');

          casper.waitForSelector('#edit-submit-delete', function(){
              this.click('#edit-submit-delete');
              this.echo('Clicked delete button');
          }, function(){
              this.render('test.png');
              this.echo('Failed to load app delete page');
          });

          casper.then(function(){
            casper.waitFor(function(){
                return this.getCurrentUrl() == app_url;
            }, function(){
                this.echo('Deleted successfully!\n');
            }, function(){
                this.render('test.png');
                this.echo('Failed to delete app\n');
            });
          });

        });
      }

  }, this.getAppUrl());

  return this;
};

twitterAppControl.prototype.updateSettings = function updateSettings(settings){
  casper.thenOpen(this.getMainUrl() + 'settings/account', function (password) {
      this.echo('Inside settings...');

      casper.waitForSelector('#user_country', function(){
          this.evaluate(function(password){
              $('#auth_password').val(password);
          }, password);

          this.fillSelectors('#account-form', {
              '#user_country': 'us',
              '#user_lang': 'en',
              '#user_time_zone': 'Pacific Time (US & Canada)',
              '#user_nsfw_view': true,
              '#user_nsfw_user': false,
              // '#show_tweet_translations': false
          }, true);

          // this.click('#show_tweet_translations');
      }, function(){
          this.capture('test.png');
          this.echo('Sth went wrong').exit();
      });

      casper.waitFor(function(){
          return this.evaluate(function(){
              return $('#settings-alert-box h4:contains("Thanks")').length > 0;
          });
      }, function(){
          this.echo('Saved').exit();
      }, function(){
          this.capture('test.png');
          this.echo('Failed to save').exit();
      });
  }, this.credentials.password);

  return this;
};

TwitterAppControl.prototype.saveNewAppCredentials = function saveNewAppCredentials(){
  // fix me: implement
  return this;
};

TwitterAppControl.prototype.execute = function execute(){
  casper.run();
  return this;
};

TwitterAppControl.prototype.getMainUrl = function getMainUrl(){
  return this.domainMain;
};

TwitterAppControl.prototype.getAppUrl = function getAppUrl(){
  return this.domainApp;
};

TwitterAppControl.prototype.getCredentials = function getCredentials(){
  return this.credentials;
};
