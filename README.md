# sogive-app

The SoGive user app - See your impact.

Try it out: <https://app.sogive.org>

This repo contains both the Java server code and the js client code.

## Javascript: Front-End Installation

These instructions assume Linux.

1. Install npm, and less

2. Make a folder to hold this repo + its siblings. We'll name this winterwell, after the company that wrote the original code.

       cd ~
       mkdir winterwell
       cd winterwell

3. Clone this repo and its siblings

       git clone git@github.com:winterstein/sogive-app.git
       git clone git@github.com:winterstein/wwappbase.js.git

Note: the sogive-app repo contains some symlinks to folders in the wwappbase.js repo.

4. Install npm packages

       cd sogive-app
       npm i

5. Compile the css (must be run from bash, not zsh)
	
       sudo apt install node-less
       ./convert.less.sh

6. Compile the js (and watch for edits)

       ./watch.sh

7. Setup a local web-server (e.g. nginx or http-server) serving the sogive-app/web folder. For example, for nginx:
  
	   sudo apt install nginx
	   cd /etc/nginx/sites-enabled
	   sudo nano ../sites-available/local.sogive.org
    
     - paste the following into the file, and replace the `root` path:
	```
	server {
		listen   80; ## listen for ipv4; this line is default and implied
		root [path to sogive-app directory e.g. /home/your_username/winterwell/sogive-app]/web;
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
	```

     - symlink the file and start nginx:

           sudo ln -s ../sites-available/local.sogive.org .
           sudo service nginx restart

8. Optional: Modify your /etc/hosts to have `127.0.0.1 local.sogive.org`

9. Test: You should be able to view your local SoGive from a browser at http://local.sogive.org. It may fail to connect with a backend server, and emit an error. But you can check the js compilation is working.

10. If you got a connection error - Edit src/js/plumbing/ServerIO.js and uncomment the line:
	`ServerIO.APIBASE = 'https://test.sogive.org';`
Your local SoGive should now connect to a test server, which has some data.

11. Celebrate as you see best. Ask Sanjay if you want a recommendation for
a high impact celebration.


## Java: Server Installation

Not needed for UI edits, but if you want to do backend work...

1. Install Java (e.g. via apt-get install)

2. Install ElasticSearch
May 2020: Currently we use version 5 (install e.g. [via docker](https://www.elastic.co/guide/en/elasticsearch/reference/5.6/docker.html#_pulling_the_image)). 
Though we will switch to version 7 soon.

3. Download bob-all.jar from https://www.winterwell.com/software/bob/ into sogive-app

4. Use Bob to fetch dependency jars:

       cd sogive-app
       java -jar bob-all.jar

5. Start ElasticSearch, with xpack security disabled (why??). 

    For example, (using docker): 
    
    ```
    docker run -p 9200:9200 -d -p 9300:9300 -e "discovery.type=single-node" -e "xpack.security.enabled=false" docker.elastic.co/elasticsearch/elasticsearch:5.6.16
    ```

6. Run SoGive Server -- from Eclipse is probably easiest

7. Some tests:
   - Test your local ElasticSearch is running: http://localhost:9200
   - Test your local java SoGiveServer is running: http://localhost:8282
   - Test nginx is routing your local java SoGiveServer: http://local.sogive.org/manifest
   - Test your local web-app: http://local.sogive.org/
  
