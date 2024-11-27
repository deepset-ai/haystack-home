#!/bin/bash

# Log node version
node -v

rm -rf haystack-tutorials
# We fetch the whole repo cause we want to use some info from the
# history, like creation date and last modified date of a notebook.
# If we fetch we depth 1 we don't get correct dates, and if we fetch with
# --filter=tree:0 the process runs slower than cloning the whole repo.
git clone https://github.com/deepset-ai/haystack-tutorials.git

cd haystack-tutorials
echo "Installing requirements for haystack-tutorials..."
python3 -m ensurepip --upgrade
python3 -m pip install -r requirements.txt
echo "Generating markdown files into ./content/tutorials..."
python3 scripts/generate_markdowns.py --index index.toml --notebooks all --output ../content/tutorials
cd ..
ls ./content/tutorials
mkdir ./static/downloads
echo "Copying notebook files into ./static/downloads..."
cp ./haystack-tutorials/tutorials/*.ipynb ./static/downloads
ls ./static/downloads

rm -rf haystack-cookbook
# We fetch the whole repo cause we want to use some info from the
# history, like creation date and last modified date of a notebook.
# If we fetch we depth 1 we don't get correct dates, and if we fetch with
# --filter=tree:0 the process runs slower than cloning the whole repo.
git clone https://github.com/deepset-ai/haystack-cookbook.git
cd haystack-cookbook
echo "Installing requirements for haystack-cookbook..."
python3 -m ensurepip --upgrade
python3 -m pip install -r requirements.txt
echo "Generating markdown files into ./content/cookbook..."
python3 scripts/generate_markdowns.py --output ../content/cookbook
cd ..
ls ./content/
mkdir ./static/downloads
echo "Copying notebook files into ./static/downloads..."
cp ./haystack-cookbook/notebooks/*.ipynb ./static/downloads
ls ./static/downloads

rm -rf haystack-integrations
git clone --depth=1 https://github.com/deepset-ai/haystack-integrations.git
cp ./haystack-integrations/integrations/*.md ./content/integrations

rm -rf haystack-advent
git clone --depth=1 https://$GITHUB_USER_NAME:$GH_HAYSTACK_HOME_PAT@github.com/deepset-ai/advent-of-haystack.git haystack-advent
cp -R ./haystack-advent/challenges/* ./content/advent-of-haystack

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

    find ./content/advent-of-haystack -name "index.md" -type f -exec bash -c '
    dir=$(dirname "{}" | sed -e "s,^.*content/advent-of-haystack/,," -e "s,/.*,,");
    sed -i "/\(http\|\/images\)/! s~!\[\([^]]*\)\]([./]*\([^)]*\))~![\1]($dir/\2)~g" "{}"
    ' \;
fi

echo "Deploy URL: ${DEPLOY_URL}"
hugo -b https://${DEPLOY_URL}
