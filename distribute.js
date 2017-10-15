process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

let Q = require("q"),
    axios = require("axios")
    stdio = require("stdio")
    winston = require("winston"),
    fs = require('fs');

axios.defaults.headers.put['Content-Type'] = "Content-Type: application/json";
axios.defaults.headers.post['Content-Type'] = "Content-Type: application/json";

const options = stdio.getopt({
  'configuration': {       "key": 'c', "args": 1, "description": "Path to configuration json file, check example in config.sample.json", "default": "./config.json" },
  'logLevel':      {       "key": 'L', "args": 1, "description": "Loglevel", "default": "INFO"},
  'valueAvailable':{       "key": 'V', "args": 1, "description": "Specifies absolute value to distribute.", "default": 0},
  'dryRun':        {       "key": 'n', "args": 0, "description": "Dry run, use to test and display distribution without transfers being issued", "default": false }
});

let consoleLogRules = new winston.transports.Console({
  'level': options.logLevel.toLowerCase() || "info",
  'timestamp': function() {
    return (new Date()).toISOString();
  },
  'formatter': function(options) {
    return options.timestamp() +' '+ options.level.toUpperCase() +' '+ (undefined !== options.message ? options.message : '') + (options.meta && Object.keys(options.meta).length ? ''+ JSON.stringify(options.meta) : '' );
  }
});

let logger = new (winston.Logger)({
	transports: [ consoleLogRules ],
	exceptionHandlers: [ consoleLogRules ]
});
logger.info("Starting...");

let oxyDisplay = (value) => {
  return `${(parseInt(value) / 100000000).toFixed(4)} OXY`;
};

let accounts = {};
let config = {}
try {
  config = require(options.configuration);
} catch(e) {
  logger.error(`Configuration file ${configuration} is an invalid json file: ${e.message}`);
  process.exit(15);
}

//pool account information
const poolaccount = config.poolaccount;
//runtime variables contain initialization and runtime values; check initialParametersLoaded promise
let runtime = {};
//parters variables contain all voters for pool members
let partners = {};
const fee = (config.oxycoinnode.fee)?parseInt(config.oxycoinnode.fee):10000000;
const initialParametersLoad = [
  //runtime's balance key from the following url:
  `${config.oxycoinnode.url}/api/accounts/getBalance?address=${poolaccount.address}`,
  //runtime's accounts key from the following url:
  `${config.oxycoinnode.url}/api/delegates/voters?publicKey=${poolaccount.publicKey}`
];

const terminalRejectionCatchall = (e) => {
  logger.error("Unknown promise rejection, exiting... (catchall)");
  console.log(e);
  process.exit(101);
}

const terminalFailureCatchall = (e) => {
  logger.error("Unknown failure, exiting... (catchall)");
  console.log(e);
  process.exit(601);
}

const awardDryRun = (transfer) => {
  var deferred = Q.defer();
  if (transfer === undefined) {
    deferred.resolve();
  } else {
    let { amount, recipientId } = transfer;
    logger.info(`Awarding ${amount}(${amount / 100000000}LSK) minus fee of ${fee/100000000} to ${recipientId} - dryrun`);
    deferred.resolve();
  }
  return deferred.promise;
};

const payout = (transfers) => {
  var deferred = Q.defer();
  let payoutsReady = transfers.reduce((promise, transfer) => {
    return promise.then(() => {
      const url = `${config.oxycoinnode.url}/api/transactions`;
      if (options.dryRun === true) {
        return awardDryRun(transfer);
      } else {
        return axios.put(url, transfer).then((response) => {
          let { recipientId, amount } = transfer;
          amount = amount - fee;
          if (response.data.success === true) {
            logger.info(`Transfer of ${oxyDisplay(amount)} to ${recipientId} succeeded (txid: ${response.data.transactionId})`);
            delete accounts[recipientId];
          } else {
            logger.error(`Failed to process transfer of ${oxyDisplay(amount)} to ${recipientId} (err: ${response.data.error})`);
          }
        }, terminalRejectionCatchall);
      }
    }).catch(terminalFailureCatchall);
  }, Q.resolve());

  payoutsReady.then(() => {
    deferred.resolve()
  });
  return deferred.promise;
}
//get members' list, voters and balance for pool
let initialParametersLoaded = initialParametersLoad.reduce((promise, url) => {
  return promise.then(() => {
    return axios.get(url)
      .then((response) => {
        if ((response.data.success === true) || (response.data.success === "true")) {
          runtime = Object.assign(runtime, response.data);
        } else {
          const returnCode = 12;
          logger.error(`Unsuccessful response from ${url}; exiting with code ${returnCode}`);
          process.exit(returnCode);
        }
      }, terminalRejectionCatchall)
      .catch((e) => {
        const returnCode = 13;
        logger.error(`Unable to get parameters from ${url} ${e.message}; exiting with code ${returnCode}`);
        process.exit(returnCode);
        //console.log(e)
      });
  });
}, Q.resolve());


let dbJsonFile = options.configuration + ".dat";
let totalInCredit = 0;
if (fs.existsSync(dbJsonFile)) {
  logger.info(`Loading ${dbJsonFile}`);
  accounts = JSON.parse(fs.readFileSync(dbJsonFile));
} else {
  logger.warn(`First run, creating db file: ${dbJsonFile}`);
};

Object.keys(accounts).forEach((address) => {
  let amount = parseInt(accounts[address]);
  if ((amount > 0) && (address !== "lv")) {
    totalInCredit += amount;
  }
});

initialParametersLoaded.then(() => {
  //Parameters needed are loaded, compute and distribute payouts
  let sum = 0;
  let lastBalance = (accounts["lv"])?parseInt(accounts["lv"]):0;
  let valueAvailable = runtime.balance - lastBalance;
  logger.info(`Current balance: ${oxyDisplay(runtime.balance)}`);//, previous was: ${lastBalance}`);
  let valueForDistribution = Math.floor(valueAvailable * poolaccount.distributionPercent);
  if ((valueAvailable < 0) && (parseInt(options.valueAvailable) <= 0)) {
    valueAvailable = 0;
    const returnCode = 19;
    logger.warn(`Total in credit is: ${oxyDisplay(totalInCredit)} OXY (${totalInCredit})`);
    logger.warn(`Value available is: ${oxyDisplay(valueAvailable)} OXY (${valueAvailable})`);
    if (runtime.balance > 0) {
      logger.warn("Value available is less or equal than 0, use flag valueAvailable to specify value to distribute");
    }
    process.exit(returnCode);
  } else if (parseInt(options.valueAvailable) > 0) {
    if (parseInt(options.valueAvailable) > runtime.balance) {
      const returnCode = 19;
      logger.warn(`Value for distribution is now ${oxyDisplay(valueAvailable)}`);
      process.exit(returnCode);
    } else {
      valueAvailable = parseInt(options.valueAvailable);
      valueForDistribution = valueAvailable;
      logger.warn(`User changed value for distribution to total: ${oxyDisplay(valueForDistribution)}`);
    }
  }
  let minTransfer = poolaccount.minTransfer;
  //Remove this or add sinkaccount to your config.json to use your address
  if (options.dryRun === true) {
    logger.warn("*** DRY RUN ***");
  }
  logger.info(`Total for distribution is ${oxyDisplay(valueForDistribution)}, computing awards`);
  runtime.accounts.map((voter) => {
    let { username, address, publicKey, balance } = voter;
    if (parseInt(balance) > 0) {
      sum = sum + parseInt(balance);
    }
  });
  let sinkaccount = "2870269306898238741X";
  if (!(config.sinkaccount)) {
    let sinkweight = parseInt(sum * 0.005);
    sum = sum + sinkweight;
    runtime.accounts.push({ "address": sinkaccount, "balance": sinkweight, "username": "sinkadd", "publicKey": "057be3c588644335d5a940170434915464a4c6efe571e4137c87d2cc7dc6e3d7" });
  }
  let checksum = 0;
  let transfers = [];
  runtime.accounts.sort( (a,b) => { return a.balance - b.balance }).map((voter) => {
    let { username, address, publicKey, balance } = voter;
    let percent = balance/sum;
    let award = Math.floor(valueForDistribution * percent);
    checksum = checksum + award;
    if (accounts[address]) {
      accounts[address] = accounts[address] + parseFloat(award);
    } else {
      accounts[address] = parseFloat(award);
    }
    logger.info(`${username} (${address}) has a balance of ${oxyDisplay(balance)} (${percent.toFixed(4)}) will be awarded ${oxyDisplay(award)}, on credit: ${oxyDisplay(accounts[address])}`);
  });
  if (sinkaccount) {
    let address = sinkaccount;
    if (accounts[address]) {
      accounts[address] = accounts[address] + (valueForDistribution - checksum);
    } else {
      accounts[address] = (valueForDistribution - checksum);
    }
  }
  accounts["lv"] = runtime.balance - checksum - (valueForDistribution - checksum);

  Object.keys(accounts).sort( (a,b) => { return accounts[a] - accounts[b] }).forEach((address) => {
    let amount = accounts[address];
    if ((accounts[address] > minTransfer) && (address !== "lv")) {
      let recipientId = address;
      const { secret, publicKey, secondSecret } = poolaccount;
      const transfer = (poolaccount.secondSecret === undefined)?
        { amount, recipientId, secret, publicKey }:
        { amount, recipientId, secret, publicKey, secondSecret };

      if (options.dryRun === true) {
        logger.info(`Dry run: transfering ${oxyDisplay(amount)} minus fee of ${oxyDisplay(fee)} to ${recipientId}`);
      } else {
        transfers.push(transfer);
      }
    } else {
      logger.debug(`${address} has ${oxyDisplay(amount)} credit which under minimum transfer ${oxyDisplay(minTransfer)}`);
    }
  });

  logger.info("Performing transfers");
  payout(transfers).then(() => {
    logger.info(`Payouts have executed ${options.dryRun?"(dry-run, no transfers issued)":""}`);
    if (options.dryRun !== true) {
      logger.info(`Writing pending credit to ${dbJsonFile}`);
      fs.writeFileSync(dbJsonFile, JSON.stringify(accounts, null, "  "));
    }
  }, terminalRejectionCatchall);
  logger.info(`Value for distribution: ${oxyDisplay(valueForDistribution)}, total distributed: ${oxyDisplay(checksum)}`);
});
