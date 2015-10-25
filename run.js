//  pidof tor | xargs sudo kill -HUP; casperjs --proxy=127.0.0.1:9050 --proxy-type=socks5 twitter_app.js email pass

var twitterAppControl = require('twitter_app_control.module').create({
    pageSettings: {
        //loadImages:  false,
        //loadPlugins: false
    },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
    viewportSize: {
        width: 1600,
        height: 900
    }
});

twitterAppControl.login().execute();
