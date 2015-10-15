//  pidof tor | xargs sudo kill -HUP; casperjs --proxy=127.0.0.1:9050 --proxy-type=socks5 twitter_app.js email pass

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

var domain = "https://www.twitter.com/";
var domain2 = "https://apps.twitter.com/";

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

casper.then(function(){
    var account_name = this.evaluate(function(){
        return $('span.u-linkComplex-target').text();
    });

    casper.thenOpen(domain2 + '/app/new', function(){
        casper.waitForSelector('#edit-tos-agreement', function(){
            this.click('#edit-tos-agreement');

            this.fill('form#twitter-apps-create-form', {
                name: account_name + Math.floor((Math.random() * 10) + 1).toString() + ' test',
                description: 'Test application',
                url: 'http://www.twitter.com/'
            }, true);

            this.click('#edit-submit');
        }, function(){
      	    this.echo('App create form not found');
      	});
    });

    casper.wait(1000, function(){ });

    casper.thenOpen(domain2, function(){
        var app_url = this.evaluate(function(){
            return $('.app-details a').attr('href').replace('/show', '/keys');
        });
        // console.log(app_url);this.exit();

        casper.thenOpen(domain2 + app_url, function(){ });

        casper.waitForSelector('#edit-submit-owner-token', function(){
            this.click('#edit-submit-owner-token');
        }, function(){
      	    this.echo('Token submit button not found');
      	});
    });

    casper.wait(1000, function(){ });

    casper.then(function(){
        this.echo(account_name);

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

        //this.capture('test.png');
    });
});

casper.run();
