#!/bin/bash

rm -rf haystack-tutorials
git clone --depth 1 https://github.com/deepset-ai/haystack-tutorials.git
echo "Copying markdown files into ./content/tutorials..."
cp ./haystack-tutorials/markdowns/* ./content/tutorials
ls ./content/tutorials
mkdir ./static/downloads
echo "Copying notebook files into ./static/downloads..."
cp ./haystack-tutorials/tutorials/*.ipynb ./static/downloads
ls ./static/downloads

npm install

# Use "localhost" if VERCEL_URL is not set
PREVIEW_URL="${VERCEL_URL:-localhost}"
# Use PREVIEW_URL if SITE_URL is not set
DEPLOY_URL="${SITE_URL:-$PREVIEW_URL}"

# Adds the directory to relative image paths in blog posts
if [[ "$DEPLOY_URL" != "localhost" ]]; then
    find ./content/blog -name "index.md" -type f -exec bash -c '
    dir=$(dirname "{}" | sed -e "s,^.*content/blog/,," -e "s,/.*,,");
    sed -i "/\(http\|\/images\)/! s~!\[\([^]]*\)\]([./]*\([^)]*\))~![\1]($dir/\2)~g" "{}"
    ' \;
fi

echo "Deploy URL: ${DEPLOY_URL}"
hugo -b https://${DEPLOY_URL}
