#!/bin/bash

rm -rf ./env-config.js
touch ./env-config.js

api_url_value=$(echo $API_URL)
domain_value=$(echo $LAGO_DOMAIN)
app_env_value=$(echo $APP_ENV)
lago_oauth_proxy_url_value=$(echo $LAGO_OAUTH_PROXY_URL)
lago_disable_signup_value=$(echo $LAGO_DISABLE_SIGNUP)
nango_public_key=$(echo $NANGO_PUBLIC_KEY)

echo "window.API_URL = \"$api_url_value\"" >> ./env-config.js
echo "window.LAGO_DOMAIN = \"$domain_value\"" >> ./env-config.js
echo "window.APP_ENV = \"$app_env_value\"" >> ./env-config.js
echo "window.LAGO_OAUTH_PROXY_URL = \"$lago_oauth_proxy_url_value\"" >> ./env-config.js
echo "window.LAGO_DISABLE_SIGNUP = \"$lago_disable_signup_value\"" >> ./env-config.js
echo "window.NANGO_PUBLIC_KEY = \"$nango_public_key\"" >> ./env-config.js
