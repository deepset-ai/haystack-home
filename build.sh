#!/bin/bash

rm -rf haystack-tutorials
git clone --depth 1 https://github.com/deepset-ai/haystack-tutorials.git
echo "Copying markdown files into ./content/tutorials..."
cp ./haystack-tutorials/markdowns/* ./content/tutorials
ls ./content/tutorials

npm install

# Use "localhost" if VERCEL_URL is not set
PREVIEW_URL="${VERCEL_URL:-localhost}"
# Use PREVIEW_URL if SITE_URL is not set
DEPLOY_URL="${SITE_URL:-$PREVIEW_URL}"

echo "Deploy URL: ${DEPLOY_URL}"
hugo -b https://${DEPLOY_URL}
