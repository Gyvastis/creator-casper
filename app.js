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

twitterAppControl.login().updateSettings().deleteApps().createApp().execute();
