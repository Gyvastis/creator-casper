# Tweeturama Creator 
* updates Twitter account settings
* creates API application
* fetches API keys

Uses `CasperJS` headless browser and `Tor` proxy network.

## Usage
 - Without a proxy `casperjs app.js email username pass phone`
 - With a proxy `casperjs --proxy=127.0.0.1:9050 --proxy-type=socks5 app.js email username pass phone`
 - To renew `tor` IP address: `pidof tor | xargs sudo kill -HUP`
 
It's not mandatory to use `tor` or the proxy.

## Example 
![Tweeturama Creator Example](http://i.imgur.com/aPHlvxm.png)