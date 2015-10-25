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
          this.echo(challenge_text.replace('{0}', 'EMAIL'));
          challenge_response = credentials.email;
      }
      else{
          this.echo(challenge_text.replace('{0}', 'PHONE'));
          challenge_response = credentials.phone;
      }

      casper.waitForSelector('#login-challenge-form', function(){
        this.fill('#login-challenge-form', {
            'challenge_response': challenge_response
        }, true);
      });
    }

    this.echo('Logged in ('+credentials.username+')!');
  });

  return this;
};

TwitterAppControl.prototype.createApp = function createApp(){
  casper.then(function(){
      var accountName = this.evaluate(function(){
          return $('.content .account-group').attr('data-screen-name');
      });

      var appName = accountName + Math.floor((Math.random() * 100) + 1).toString() + ' test';

      casper.thenOpen(domainApp + '/app/new', function(){
          casper.waitForSelector('#edit-tos-agreement', function(){
              this.click('#edit-tos-agreement');

              this.fill('form#twitter-apps-create-form', {
                  name: appName,
                  description: 'Test application',
                  url: domainMain
              }, true);

              this.click('#edit-submit');
          }, function(){
        	    this.echo('Application creation form not found.');
              this.capture('test.png').exit();
        	});
      });


      casper.waitFor(function(){
          return this.getTitle().indexOf(appName) >= 0
      }, function(){
          this.echo('App created!');

          casper.thenOpen(domainApp, function(){
              var currentAppUrl = this.evaluate(function(){
                  return $('.app-details a').attr('href').replace('/show', '/keys');
              });

              casper.thenOpen(domainApp + currentAppUrl, function(){
                casper.waitForSelector('#edit-submit-owner-token', function(){
                    this.echo('Creating tokens...');
                    this.click('#edit-submit-owner-token');
                }, function(){
                    this.echo('Tokens creation failed.');
                    this.capture('test.png').exit();
                });
              });
          });
      }, function(){
          this.echo('Failed to create application.');
          this.capture('test.png').exit();
      });

      casper.waitForSelector('.access', function(){
          this.echo('Retrieving application credentials...');

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
      }, function(){
        this.echo('Failed to fully prepare new application.');
        this.capture('test.png').exit();
      });
  });

  return this;
};

TwitterAppControl.prototype.deleteApps = function deleteApps(){
  casper.thenOpen(domainApp, function(){
      this.echo('Checking for existing applications...');

      var apps = this.evaluate(function(){
         return $('.twitter-app .app-details a').map(function(){ return this.getAttribute('href'); }).get();
      });
      var appDeletionUrls = [];

      if(apps.length > 0){
        this.echo('Found some apps: ' + JSON.stringify(apps) + '!');

        for(var i = 0; i < apps.length; i++){
          appDeletionUrls.push(domainApp + apps[i].replace('/show', '/delete'));
        }

        this.echo('Deleting applications...');
      }
      else{
        this.echo('No applications found!');
        return this;
      }

      casper.each(appDeletionUrls, function(self, deleteUrl){
        self.thenOpen(deleteUrl, function(){
          self.waitForSelector('#edit-submit-delete', function(){
              this.click('#edit-submit-delete');
          }, function(){
              this.echo('Failed to load application deletion page.');
              this.render('test.png');
          });

          self.waitFor(function(){
              return this.getCurrentUrl() == domainApp;
          }, function(){
              this.echo('Application deleted successfully!');
          }, function(){
              this.echo('Failed to delete application.');
              this.render('test.png');
          });
        });
      });
  });

  return this;
};

TwitterAppControl.prototype.updateSettings = function updateSettings(){
  var credentials = this.getCredentials();

  casper.thenOpen(domainMain + 'settings/account', function () {
      this.echo('Updating settings...');

      casper.waitForSelector('#user_country', function(){
          this.evaluate(function(password){
              $('#auth_password').val(password);
          }, credentials.password);

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
          this.echo('Failed to load settings page.');
      });

      casper.waitFor(function(){
          return this.evaluate(function(){
              return $('#settings-alert-box h4:contains("Thanks")').length > 0;
          });
      }, function(){
          this.echo('Settings saved!');
      }, function(){
          this.echo('Failed to update settings.');
          this.capture('test.png');
      });
  });

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
