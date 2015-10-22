//  pidof tor | xargs sudo kill -HUP; casperjs --proxy=127.0.0.1:9050 --proxy-type=socks5 twitter_app.js email pass

var casper = require('casper').create({
    pageSettings: {
        // loadImages:  false,
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

casper.thenOpen(domain2, function(){
    this.echo('Checking apps...');

    apps = this.evaluate(function(){
       return $('.twitter-app .app-details a').map(function(){ return this.getAttribute('href'); }).get();
    });

    this.echo(JSON.stringify(apps));

    for(var i = 0; i < apps.length; i++){

      casper.thenOpen(domain2 + apps[i].replace('/show', '/delete'), function(){

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
              return this.getCurrentUrl() == domain2;
          }, function(){
              this.echo('Deleted successfully!');
          }, function(){
              this.render('test.png');
              this.echo('Failed to delete app');
          });
        });

      });
    }

});

casper.run();
