# copy this to nginx sites-available, also modify etc/hosts
server {
	listen   80; ## listen for ipv4; this line is default and implied

	root /home/daniel/winterwell/sogive-app/web;
	index index.html;

	server_name local.sogive.org;

	location / {
			try_files $uri $uri/ @backend;
			add_header 'Access-Control-Allow-Origin' "$http_origin";
			add_header 'Access-Control-Allow-Credentials' 'true';
	}

	location @backend {
			proxy_pass              http://localhost:8282;
			proxy_set_header        X-Real-IP $remote_addr;
			proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
			proxy_set_header        Host $http_host;
	}

}
