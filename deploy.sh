#!/usr/bin/env bash

display_usage() {
  echo -e "\nUsage: $0 [version] [dev|stage|preprod|prod]\n"
}

promote_to_env() {
  VERSION=$1
  ENV=$2

  # Build a deployment file
  yarn run plant-beanstalk ${VERSION}
  eb deploy prisonstaffhub-${ENV} --verbose --label ${VERSION}
}

# if less than two arguments supplied, display usage
if [  $# -le 1 ]
then
  display_usage
  exit 1
fi

# check whether user had supplied -h or --help . If yes display usage
if [[ ( $# == "--help") ||  $# == "-h" ]]
then
  display_usage
  exit 0
fi

VERSION=$1
ENV=$2

if [[ "$ENV" =~ ^(dev|stage|preprod|prod)$ ]]; then
    echo "Deploying to $ENV"
else
    echo "$ENV is not a valid environment"
fi

promote_to_env ${VERSION} ${ENV}



