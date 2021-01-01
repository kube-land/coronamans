# coronamans

## Config

* `coronamans`: `/usr/local/bin/coronamans`
* `conf/coronamans.service`: `/lib/systemd/system/coronamans.service`
* `conf/nginx.conf`: `/etc/nginx/nginx.conf`
* `console/dist`: `/usr/share/nginx/coronamans`

## Local dev

set `"apiUri": "http://localhost:8080"`

`go build . && ./coronamans`
`docker run -it -v $(PWD):/workspace -p 3000:3000 node bash`
`docker run -it -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=corona -p 3306:3306 mariadb`
