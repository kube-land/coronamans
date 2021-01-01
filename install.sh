#! /bin/bash
set -xe

go build .
service coronamans stop
cp -f coronamans /usr/local/bin/
rm -rf /usr/share/nginx/coronamans
cp -rf console/dist /usr/share/nginx/coronamans
service coronamans start
service nginx restart