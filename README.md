# casperjs-twitter-control
Updates Twitter account settings, creates API application, fetches API keys. Uses `CasperJS` headless browser and `Tor` proxy network.

## Usage
1. Create `accs.txt` with accounts you want to manage. 
2. Create `output.json` for Twitter application API keys.
3. Run: php run_loc.php; chmod +x run_loc.sh; ./run_loc.sh; rm run_loc.sh
4. Same proxy is used for 5 accounts, then `Tor` requests new IP address and proceeds to the next account.

### Dependancies
`casperjs`
`tor`
