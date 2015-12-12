# casperjs-twitter-control
* updates Twitter account settings
* creates API application
* fetches API keys
Uses `CasperJS` headless browser and `Tor` proxy network.

## Usage
1. Create `accs.txt` with accounts you want to manage. 
2. Create `output.json` for Twitter application API keys.
3. Run: `php run.php; chmod +x run.sh; ./run.sh; rm run.sh`
4. Same proxy is used for 5 accounts, then `Tor` requests new IP address and proceeds to the next account.

### Dependancies
`casperjs`
`tor`
`php`
