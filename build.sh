#!/bin/bash

rm -rf haystack-tutorials
git clone --depth 1 https://github.com/deepset-ai/haystack-tutorials.git
echo "Copying markdown files into ./content/tutorials..."
cp ./haystack-tutorials/markdowns/* ./content/tutorials
ls ./content/tutorials

npm install

# Use "localhost" if VERCEL_URL is not set
PREVIEW_URL="${VERCEL_URL:-localhost}"
hugo -b https://${SITE_URL:-$PREVIEW_URL}
