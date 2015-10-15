//  pidof tor | xargs sudo kill -HUP; casperjs --proxy=127.0.0.1:9050 --proxy-type=socks5 twitter_app.js email pass

var casper = require('casper').create({
    pageSettings: {
        loadImages:  false,
        //loadPlugins: false
    },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
    viewportSize: {
        width: 1600,
        height: 900
    }
    //clientScripts: ["jquery-1.11.3.min.js"]
});

var domain = "https://www.twitter.com/";

var email     = casper.cli.get(0);
var username  = casper.cli.get(1);
var password  = casper.cli.get(2);
var phone     = casper.cli.get(3);

casper.start();

casper.thenOpen(domain + 'login', function () {
    this.fill('form.signin', {
        'session[username_or_email]': username,
        'session[password]': password
    }, true);
});

casper.then(function(){
  var challenge_text = '';

  if(this.getCurrentUrl().indexOf("login_challenge") > 0){
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
});

casper.thenOpen(domain + 'settings/account', function () {
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
});

casper.run();
