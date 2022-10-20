#!/bin/bash

rm -rf haystack-tutorials
git clone --depth 1 https://github.com/deepset-ai/haystack-tutorials.git
cp ./haystack-tutorials/markdowns/* ./content/tutorials
rm -rf haystack-tutorials