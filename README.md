# oxypool
Oxycoin pool

## Installing
```
git clone https://github.com/h-machado/oxypool.git
cd oxypool
npm install

```

## Configuring
For the pool to work for your delegates/accounts of oxycoin, you must configure "config.json" file.

You'll find the default file as this:
```
{
  "oxycoinnode": {
    "url field": "you should use localhost or restrict usage inside controlled network, if not, HTTPS please",
    "url": "https://testnet.oxycoin.io",
    "environment": "testnet",
    "fee": 10000000
  },
  "poolaccount": {
    "secret": "YOUR SECRET",
    "publicKey": "Your public key, check in your oxycoin wallet 'My Profile', it's the big string under address",
    "address": "Your address for balance checking and whatnot",
    "distributionPercent": 0.1,
    "minTransfer": 100000000
  }
}
```
1. Edit "url" value, the second line at "oxycoinnode" object. Use "localhost" or an address of an oxycoin node of your trust.
2. Edit "poolaccount" element, place your secret, publicKey and address.
3. Adjust the distribution percentage you want to deliver to your voters, the default is 10.

## Executing
Just run node:
```
node .
```

For now it's intended to be launched from the crontable or from a terminal window with the desired frequency (hourly, daily, whatever).

The software keeps track of your balance and account credits on a filename at the same place as config.json with suffix .dat.

Help is available
```
node . --help
```

### Example of an execution, 1st run
```
testuser@hostname:/data/code/oxypool$ node distribute.js -c /oxycoin/oxypool/config/oxypool_testnet.json
2017-10-15T15:06:37.527Z INFO Starting...
2017-10-15T15:06:37.530Z WARN First run, creating db file: /oxycoin/oxypool/config/oxypool_testnet.json.dat
2017-10-15T15:06:39.205Z INFO Current balance: 8562.0391 OXY
2017-10-15T15:06:39.205Z INFO Total for distribution is 8.5620 OXY, computing awards
2017-10-15T15:06:39.206Z INFO null (2719269382989113973X) has a balance of 299.0000 OXY (0.0006) will be awarded 0.0050 OXY, on credit: 0.0050 OXY
2017-10-15T15:06:39.206Z INFO null (13573630800616621328X) has a balance of 499.0000 OXY (0.0010) will be awarded 0.0083 OXY, on credit: 0.0083 OXY
2017-10-15T15:06:39.206Z INFO null (6614821626705730951X) has a balance of 499.0000 OXY (0.0010) will be awarded 0.0083 OXY, on credit: 0.0083 OXY
2017-10-15T15:06:39.206Z INFO null (8220372755427536656X) has a balance of 599.0000 OXY (0.0012) will be awarded 0.0100 OXY, on credit: 0.0100 OXY
2017-10-15T15:06:39.207Z INFO null (12783245726829407568X) has a balance of 749.0000 OXY (0.0015) will be awarded 0.0125 OXY, on credit: 0.0125 OXY
2017-10-15T15:06:39.207Z INFO null (13887179451696960799X) has a balance of 799.0000 OXY (0.0016) will be awarded 0.0133 OXY, on credit: 0.0133 OXY
2017-10-15T15:06:39.207Z INFO sinkadd (2870269306898238741X) has a balance of 2552.9401 OXY (0.0050) will be awarded 0.0426 OXY, on credit: 0.0426 OXY
2017-10-15T15:06:39.211Z INFO dredson1983 (7388736101499900117X) has a balance of 6630.6521 OXY (0.0129) will be awarded 0.1106 OXY, on credit: 0.1106 OXY
2017-10-15T15:06:39.211Z INFO genesisDelegate60 (5621844696109187628X) has a balance of 500513.3745 OXY (0.9754) will be awarded 8.3513 OXY, on credit: 8.3513 OXY
2017-10-15T15:06:39.212Z INFO Performing transfers
2017-10-15T15:06:39.212Z INFO Value for distribution: 8.5620 OXY, total distributed: 8.5620 OXY
2017-10-15T15:06:39.938Z INFO Transfer of 8.2513 OXY to 5621844696109187628X succeeded (txid: 17068047009919287832)
2017-10-15T15:06:39.939Z INFO Payouts have executed 
2017-10-15T15:06:39.939Z INFO Writing pending credit to /oxycoin/oxypool/config/oxypool_testnet.json.dat
```

### Example of an execution, 2nd run
```
testuser@hostname:/data/code/oxypool$ node distribute.js -c /oxycoin/oxypool/config/oxypool_testnet.json
2017-10-15T15:08:08.249Z INFO Starting...
2017-10-15T15:08:08.252Z INFO Loading /oxycoin/oxypool/config/oxypool_testnet.json.dat
2017-10-15T15:08:10.299Z INFO Current balance: 8555.2071 OXY
2017-10-15T15:08:10.299Z INFO Total for distribution is 0.0017 OXY, computing awards
2017-10-15T15:08:10.301Z INFO null (2719269382989113973X) has a balance of 299.0000 OXY (0.0006) will be awarded 0.0000 OXY, on credit: 0.0050 OXY
2017-10-15T15:08:10.301Z INFO null (13573630800616621328X) has a balance of 499.0000 OXY (0.0010) will be awarded 0.0000 OXY, on credit: 0.0083 OXY
2017-10-15T15:08:10.301Z INFO null (6614821626705730951X) has a balance of 499.0000 OXY (0.0010) will be awarded 0.0000 OXY, on credit: 0.0083 OXY
2017-10-15T15:08:10.302Z INFO null (8220372755427536656X) has a balance of 599.0000 OXY (0.0012) will be awarded 0.0000 OXY, on credit: 0.0100 OXY
2017-10-15T15:08:10.302Z INFO null (12783245726829407568X) has a balance of 749.0000 OXY (0.0015) will be awarded 0.0000 OXY, on credit: 0.0125 OXY
2017-10-15T15:08:10.302Z INFO null (13887179451696960799X) has a balance of 799.0000 OXY (0.0016) will be awarded 0.0000 OXY, on credit: 0.0133 OXY
2017-10-15T15:08:10.303Z INFO sinkadd (2870269306898238741X) has a balance of 2553.0236 OXY (0.0050) will be awarded 0.0000 OXY, on credit: 0.0426 OXY
2017-10-15T15:08:10.304Z INFO dredson1983 (7388736101499900117X) has a balance of 6630.6521 OXY (0.0129) will be awarded 0.0000 OXY, on credit: 0.1107 OXY
2017-10-15T15:08:10.305Z INFO genesisDelegate60 (5621844696109187628X) has a balance of 500530.0772 OXY (0.9754) will be awarded 0.0017 OXY, on credit: 0.0017 OXY
2017-10-15T15:08:10.305Z INFO Performing transfers
2017-10-15T15:08:10.305Z INFO Value for distribution: 0.0017 OXY, total distributed: 0.0017 OXY
2017-10-15T15:08:10.306Z INFO Payouts have executed 
2017-10-15T15:08:10.306Z INFO Writing pending credit to /oxycoin/oxypool/config/oxypool_testnet.json.dat
```
Oxypool leaves the developer 0.5 in credit of the account configured.
If you wish to keep this for yourself or award others, please add at the config "config.sinkaccount.address" element with an address of your choosing.

### Example of an execution, dry run (no transfers, no upkeep)
Just add the "-n" or "--dryRun" flag, like so:
```
testuser@hostname:/data/code/oxypool$ node distribute.js -c /oxycoin/oxypool/config/oxypool_testnet.json -n
2017-10-15T15:08:08.249Z INFO Starting...
2017-10-15T15:08:08.252Z INFO Loading /oxycoin/oxypool/config/oxypool_testnet.json.dat
2017-10-15T15:08:10.299Z INFO Current balance: 8555.2071 OXY
2017-10-15T15:08:10.299Z WARN *** DRY RUN ***
2017-10-15T15:08:10.299Z INFO Total for distribution is 0.0017 OXY, computing awards
2017-10-15T15:08:10.301Z INFO null (2719269382989113973X) has a balance of 299.0000 OXY (0.0006) will be awarded 0.0000 OXY, on credit: 0.0050 OXY
2017-10-15T15:08:10.301Z INFO null (13573630800616621328X) has a balance of 499.0000 OXY (0.0010) will be awarded 0.0000 OXY, on credit: 0.0083 OXY
2017-10-15T15:08:10.301Z INFO null (6614821626705730951X) has a balance of 499.0000 OXY (0.0010) will be awarded 0.0000 OXY, on credit: 0.0083 OXY
2017-10-15T15:08:10.302Z INFO null (8220372755427536656X) has a balance of 599.0000 OXY (0.0012) will be awarded 0.0000 OXY, on credit: 0.0100 OXY
2017-10-15T15:08:10.302Z INFO null (12783245726829407568X) has a balance of 749.0000 OXY (0.0015) will be awarded 0.0000 OXY, on credit: 0.0125 OXY
2017-10-15T15:08:10.302Z INFO null (13887179451696960799X) has a balance of 799.0000 OXY (0.0016) will be awarded 0.0000 OXY, on credit: 0.0133 OXY
2017-10-15T15:08:10.303Z INFO sinkadd (2870269306898238741X) has a balance of 2553.0236 OXY (0.0050) will be awarded 0.0000 OXY, on credit: 0.0426 OXY
2017-10-15T15:08:10.304Z INFO dredson1983 (7388736101499900117X) has a balance of 6630.6521 OXY (0.0129) will be awarded 0.0000 OXY, on credit: 0.1107 OXY
2017-10-15T15:08:10.305Z INFO genesisDelegate60 (5621844696109187628X) has a balance of 500530.0772 OXY (0.9754) will be awarded 0.0017 OXY, on credit: 0.0017 OXY
2017-10-15T15:08:10.305Z INFO Performing transfers
2017-10-15T15:08:10.305Z INFO Value for distribution: 0.0017 OXY, total distributed: 0.0017 OXY
2017-10-15T15:14:34.441Z INFO Payouts have executed (dry-run, no transfers issued)
```
Nothing will be written to the database so you can test before using.

## Documentation
Documentation is in progress to describe in detail the works of the software.

Meanwhile, read the code, it's pretty straightforward.

## Disclaimer
This software distributes a given percentage of your earnings at the account configured through the voters of that account, based on their weight.

Feature requests, or problems, please just open an issue or push request.

