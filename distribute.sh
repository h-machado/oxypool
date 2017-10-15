#!/usr/bin/env bash

REQUIRED_PROGRAMS_IN_PATH="npm node jq"
CONFIG_FILE=$(pwd)/config.json

for program in ${REQUIRED_PROGRAMS}; do
  if command -v ${program} > /dev/null 2>&1; then
    echo ${program} exists in path
  else
    echo You must install program ${program} and have it path
    exit 10
  fi
done

if npm install > /dev/null 2>&1; then
  echo > /dev/null
else
  echo Failure to install npm packages \(behind proxy?\)
  echo You must execute \"npm install\" successfully
  exit 20
fi

if [ -f ${CONFIG_FILE} ]; then
  echo Using config file ${CONFIG_FILE}
else
  echo Configuration file not present, create ${CONFIG_FILE}
fi

URL=$(cat ${CONFIG_FILE} | jq '.oxycoinnode.url')
FEE=$(cat ${CONFIG_FILE} | jq '.oxycoinnode.fee')
SECRET=$(cat ${CONFIG_FILE} | jq '.poolaccount.secret')
PUBLICKEY=$(cat ${CONFIG_FILE} | jq '.poolaccount.publicKey')
ADDRESS=$(cat ${CONFIG_FILE} | jq '.poolaccount.address')
DISTPERCENT=$(cat ${CONFIG_FILE} | jq '.poolaccount.distributionPercent')
MINTRANSFER=$(cat ${CONFIG_FILE} | jq '.poolaccount.minTransfer')

if [ "${ADDRESS}" == "\"Your address for balance checking and whatnot\"" ]; then
  echo ERROR: You must configure your OXY address in ${CONFIG_FILE} \(poolaccount.address\)
  exit 20
fi

if [ "${PUBLICKEY}" == "\"The public key for this address and secret\"" ]; then
  echo ERROR: You must configure your OXY public key in ${CONFIG_FILE} \(poolaccount.publicKey\)
  echo \ \ \ \ \ \ \ Get it on your node, click My Porfile, it\'s the string below the address
  echo \ \ \ \ \ \ \ We recommend a node installed locally or in a container
  echo \ \ \ \ \ \ \ If outside your network, we recommend HTTPS
  exit 30
fi

if [ "${SECRET}" == "\"YOUR SECRET\"" ]; then
  echo ERROR: You must configure your OXY secret in ${CONFIG_FILE} \(poolaccount.secret\)
  echo \ \ \ \ \ \ \ We recommend a node installed locally or in a container
  echo \ \ \ \ \ \ \ If outside your network, we recommend HTTPS
  exit 40
fi

if [ "${URL}" == "https://testnet.oxycoin.io" ]; then
  echo WARNING: You should configure oxycoinnode.url to your personal node in ${CONFIG_FILE}
  echo \ \ \ \ \ \ \ \ \ We would recommend a node installed locally or in a container
  echo \ \ \ \ \ \ \ \ \ If outside your network, we recommend HTTPS
fi

if [ "${FEE}" == "10000000" ]; then
  echo INFO: Fee is set to 0.1 OXY \(10000000\)
  echo \ \ \ \ \ \ Should this change in the future, please edit ${CONFIG_FILE}
fi

if [ "${DISTPERCENT}" == "0.1" ]; then
  echo INFO: Distribution percent is set to 0.1, that\'s 10% 
  echo \ \ \ \ \ \ This is the default, you can change it at ${CONFIG_FILE}
fi

if [ "${MINTRANSFER}" == "100000000" ]; then
  echo INFO: Fee is set to 100000000, that\'s 1 OXY \(a 1 followed by 8 zeros\)
  echo \ \ \ \ \ \ This is the default, you can change it at ${CONFIG_FILE}
fi

if [ -f "${CONFIG_FILE}.dat" ]; then
  echo INFO: JSON file with pending credits is ${CONFIG_FILE}.dat
else
  echo INFO: JSON file with pending credits will be ${CONFIG_FILE}.dat
fi

echo Executing:
echo \ \ \ node . -n

node . -n

echo Execute \"node .\" to perform transactions and write file with credits
