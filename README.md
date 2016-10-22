# casperjs-twitter-control
* updates Twitter account settings
* creates API application
* fetches API keys

Uses `CasperJS` headless browser and `Tor` proxy network.

## Usage
 - `casperjs --proxy=127.0.0.1:9050 --proxy-type=socks5 app.js email username pass phone`
 - To renew `tor` IP address: `pidof tor | xargs sudo kill -HUP`