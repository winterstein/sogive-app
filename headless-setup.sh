#!/bin/bash

#auto-magic sogive build from pure CLI

##########################################
#####Preflight checks
##########################################
## git
if [[ $(which git) = '' ]]; then
	printf "\nYou must first install 'git' before running this script\n"
	exit 0
fi
## java
if [[ $(which javac) = '' ]]; then
	printf "\nYou must first install openjdk-8-jre and openjdk-8-jdk before running this script\n"
	exit 0
fi
## private winterwell@soda.sh key for the private git repos
if [[ $(find ~/.ssh -name "winterwell@soda.sh") = '' ]]; then
	printf "\nYou haven't given this machine the private winterwell ssh key."
	exit 0
fi
## maven
if [[ $(which mvn) = '' ]]; then
	printf "\nYou must first install maven before running this script\n"
	exit 0
fi
## 7zip
if [[ $(which 7z) = '' ]]; then
	printf "\nYou must first install 7zip before running this script\n"
	exit 0
fi

ssh-keyscan git.winterwell.com >> ~/.ssh/known_hosts
touch ~/.ssh/config
printf "\nHost\tgit.winterwell.com\n\tHostName\tgit.winterwell.com\n\tUser\twinterwell\n\tIdentityFile\t~/.ssh/winterwell@soda.sh\n" >> ~/.ssh/config

##########################################
###### Starting
##########################################
printf "\nGetting necessary dependency JARs...\n"
TMP_LIB='/home/winterwell/middleware'
mkdir -p $TMP_LIB
##Android.jar
wget -cO - https://github.com/winterstein/JTwitter/blob/master/liblocal/android-dummy.jar?raw=true >> $TMP_LIB/android.jar

##arpack_combo
wget -cO - http://repo.scalanlp.org/repo/netlib/arpack-combo/0.1/arpack-combo-0.1.jar >> $TMP_LIB/arpack_combo-0.1.jar

##bob.jar
wget -cO - https://www.winterwell.com/software/downloads/bob.jar >> $TMP_LIB/bob.jar

##bonecp
wget -cO - http://central.maven.org/maven2/com/jolbox/bonecp/0.7.1.RELEASE/bonecp-0.7.1.RELEASE.jar >> $TMP_LIB/bonecp.jar

##bzip2
wget -cO - http://www.kohsuke.org/bzip2/bzip2.jar >> $TMP_LIB/bzip2.jar

##commons-codec
wget -cO - http://central.maven.org/maven2/commons-codec/commons-codec/1.9/commons-codec-1.9.jar >> $TMP_LIB/commons-codec.jar

##commons-collections
wget -cO - http://central.maven.org/maven2/commons-collections/commons-collections/3.2.1/commons-collections-3.2.1.jar >> $TMP_LIB/commons-collections-3.2.1.jar

##commons-fileupload
wget -cO - http://central.maven.org/maven2/commons-fileupload/commons-fileupload/1.2.1/commons-fileupload-1.2.1.jar >> $TMP_LIB/commons-fileupload-1.2.1.jar

##commons-io-2.4
wget -cO - http://central.maven.org/maven2/commons-io/commons-io/2.4/commons-io-2.4.jar >> $TMP_LIB/commons-io-2.X.jar

##commons-lang
wget -cO - http://central.maven.org/maven2/org/apache/commons/commons-lang3/3.4/commons-lang3-3.4.jar >> $TMP_LIB/commons-lang.jar

##commons-logging
wget -cO - http://central.maven.org/maven2/commons-logging/commons-logging/1.1.1/commons-logging-1.1.1.jar >> $TMP_LIB/commons-logging.jar

##commons-math3
wget -cO - http://central.maven.org/maven2/org/apache/commons/commons-math3/3.6.1/commons-math3-3.6.1.jar >> $TMP_LIB/commons-math3.jar

##commons-net
wget -cO - http://central.maven.org/maven2/commons-net/commons-net/3.2/commons-net-3.2.jar >> $TMP_LIB/commons-net.jar

##compact-language-detector.jar
wget -cO - https://github.com/sodash/custom-middleware/blob/master/cld.jar?raw=true >> $TMP_LIB/cld.jar

##dnsjava -- not sure which version
wget -cO - http://central.maven.org/maven2/dnsjava/dnsjava/2.1.8/dnsjava-2.1.8.jar >> $TMP_LIB/dnsjava.jar

##ejb3-persistence
wget -cO - http://central.maven.org/maven2/org/hibernate/ejb3-persistence/1.0.2.GA/ejb3-persistence-1.0.2.GA.jar >> $TMP_LIB/ejb3-persistence.jar

##elasticsearch-5.1.2.jar
wget -cO - http://central.maven.org/maven2/org/elasticsearch/elasticsearch/5.1.2/elasticsearch-5.1.2.jar >> $TMP_LIB/elasticsearch-5.1.2.jar

##fasttag
wget -cO - https://github.com/sodash/custom-middleware/blob/master/fasttag.jar?raw=true >> $TMP_LIB/fasttag.jar
cd $TMP_LIB && 7z x fasttag.jar
cd $TMP_LIB && find com/ -iname "*.class" -print | xargs jar -cf $TMP_LIB/fasttag.jar
rm -rf $TMP_LIB/com
rm -rf $TMP_LIB/lexicon.txt
rm -rf $TMP_LIB/README.txt
rm -rf $TMP_LIB/META-INF

##gson-original.jar
wget -cO - http://central.maven.org/maven2/com/google/code/gson/gson/2.2.4/gson-2.2.4.jar >> $TMP_LIB/gson-original.jar

##guava.jar
wget -cO - http://central.maven.org/maven2/com/google/guava/guava/21.0/guava-21.0.jar >> $TMP_LIB/guava.jar

##HdrHistogram-2.1.6.jar
wget -cO - http://central.maven.org/maven2/org/hdrhistogram/HdrHistogram/2.1.6/HdrHistogram-2.1.6.jar >> $TMP_LIB/HdrHistogram-2.1.6.jar

##hppc-0.7.1.jar
wget -cO - http://central.maven.org/maven2/com/carrotsearch/hppc/0.7.1/hppc-0.7.1.jar >> $TMP_LIB/hppc-0.7.1.jar

##httpclient-4.X.jar
wget -cO - http://central.maven.org/maven2/org/apache/httpcomponents/httpclient/4.1.2/httpclient-4.1.2.jar >> $TMP_LIB/httpclient-4.X.jar

##httpclient-cache-4.X.jar
wget -cO - http://central.maven.org/maven2/org/apache/httpcomponents/httpclient-cache/4.1.2/httpclient-cache-4.1.2.jar >> $TMP_LIB/httpclient-cache-4.X.jar

##httpcore-4.X.jar
wget -cO - http://central.maven.org/maven2/org/apache/httpcomponents/httpcore/4.1.2/httpcore-4.1.2.jar >> $TMP_LIB/httpcore-4.X.jar

##httpmime-4.X.jar
wget -cO - http://central.maven.org/maven2/org/apache/httpcomponents/httpmime/4.1.2/httpmime-4.1.2.jar >> $TMP_LIB/httpmime-4.X.jar

##jackson-core-2.8.1.jar
wget -cO - http://central.maven.org/maven2/com/fasterxml/jackson/core/jackson-core/2.8.1/jackson-core-2.8.1.jar >> $TMP_LIB/jackson-core-2.8.1.jar

##jackson-dataformat-cbor-2.8.1.jar
wget -cO - http://central.maven.org/maven2/com/fasterxml/jackson/dataformat/jackson-dataformat-cbor/2.8.1/jackson-dataformat-cbor-2.8.1.jar >> $TMP_LIB/jackson-dataformat-cbor-2.8.1.jar

##jackson-dataformat-smile-2.8.1.jar
wget -cO - http://central.maven.org/maven2/com/fasterxml/jackson/dataformat/jackson-dataformat-smile/2.8.1/jackson-dataformat-smile-2.8.1.jar >> $TMP_LIB/jackson-dataformat-smile-2.8.1.jar

##jackson-dataformat-yaml-2.8.1.jar
wget -cO - http://central.maven.org/maven2/com/fasterxml/jackson/dataformat/jackson-dataformat-yaml/2.8.1/jackson-dataformat-yaml-2.8.1.jar >> $TMP_LIB/jackson-dataformat-yaml-2.8.1.jar

##java2html.jar
wget -cO - http://central.maven.org/maven2/de/java2html/java2html/5.0/java2html-5.0.jar >> $TMP_LIB/java2html.jar

##javax.mail.jar
wget -cO - http://central.maven.org/maven2/com/sun/mail/javax.mail/1.5.5/javax.mail-1.5.5.jar >> $TMP_LIB/javax.mail.jar

##javax.servlet-api.jar
wget -cO - http://central.maven.org/maven2/javax/servlet/javax.servlet-api/3.1.0/javax.servlet-api-3.1.0.jar >> $TMP_LIB/javax.servlet-api.jar

##jetty-continuation.jar
wget -cO - http://central.maven.org/maven2/org/eclipse/jetty/jetty-continuation/8.1.3.v20120416/jetty-continuation-8.1.3.v20120416.jar >> $TMP_LIB/jetty-continuation.jar

##jetty-http.jar
wget -cO - http://central.maven.org/maven2/org/eclipse/jetty/jetty-http/9.4.8.v20171121/jetty-http-9.4.8.v20171121.jar >> $TMP_LIB/jetty-http.jar

##jetty-io.jar
wget -cO - http://central.maven.org/maven2/org/eclipse/jetty/jetty-io/9.4.8.v20171121/jetty-io-9.4.8.v20171121.jar >> $TMP_LIB/jetty-io.jar

##jetty-security.jar
wget -cO - http://central.maven.org/maven2/org/eclipse/jetty/jetty-security/9.4.8.v20171121/jetty-security-9.4.8.v20171121.jar >> $TMP_LIB/jetty-security.jar

##jetty-server.jar
wget -cO - http://central.maven.org/maven2/org/eclipse/jetty/jetty-server/9.4.8.v20171121/jetty-server-9.4.8.v20171121.jar >> $TMP_LIB/jetty-server.jar

##jetty-servlet.jar
wget -cO - http://central.maven.org/maven2/org/eclipse/jetty/jetty-servlet/9.4.8.v20171121/jetty-servlet-9.4.8.v20171121.jar >> $TMP_LIB/jetty-servlet.jar

##jetty-util.jar
wget -cO - http://central.maven.org/maven2/org/eclipse/jetty/jetty-util/9.4.8.v20171121/jetty-util-9.4.8.v20171121.jar >> $TMP_LIB/jetty-util.jar

##jetty-util-ajax.jar
wget -cO - http://central.maven.org/maven2/org/eclipse/jetty/jetty-util-ajax/9.4.8.v20171121/jetty-util-ajax-9.4.8.v20171121.jar >> $TMP_LIB/jetty-util-ajax.jar

##jetty-websocket.jar
wget -cO - http://central.maven.org/maven2/org/eclipse/jetty/jetty-websocket/8.1.13.v20130916/jetty-websocket-8.1.13.v20130916.jar >> $TMP_LIB/jetty-websocket.jar

##jna-4.2.2.jar
wget -cO - http://central.maven.org/maven2/net/java/dev/jna/jna/4.2.2/jna-4.2.2.jar >> $TMP_LIB/jna-4.2.2.jar

##joda-time-2.9.5.jar
wget -cO - http://central.maven.org/maven2/joda-time/joda-time/2.9.5/joda-time-2.9.5.jar >> $TMP_LIB/joda-time-2.9.5.jar

##jopt-simple-5.0.2.jar
wget -cO - http://central.maven.org/maven2/net/sf/jopt-simple/jopt-simple/5.0.2/jopt-simple-5.0.2.jar >> $TMP_LIB/jopt-simple-5.0.2.jar

##jose4j.jar
wget -cO - http://central.maven.org/maven2/org/bitbucket/b_c/jose4j/0.5.2/jose4j-0.5.2.jar >> $TMP_LIB/jose4j.jar

##jsch.jar
wget -cO - http://central.maven.org/maven2/com/jcraft/jsch/0.1.50/jsch-0.1.50.jar >> $TMP_LIB/jsch.jar

##jsr305.jar
wget -cO - http://central.maven.org/maven2/com/google/code/findbugs/jsr305/3.0.1/jsr305-3.0.1.jar >> $TMP_LIB/jsr305.jar

##jts-1.13.jar
wget -cO - http://central.maven.org/maven2/com/vividsolutions/jts/1.13/jts-1.13.jar >> $TMP_LIB/jts-1.13.jar

##junit.jar
wget -cO - http://central.maven.org/maven2/junit/junit/4.12/junit-4.12.jar >> $TMP_LIB/junit.jar

##jwnl.jar
wget -cO - http://www.java2s.com/Code/JarDownload/jwnl/jwnl-1.3.3.jar.zip >> $TMP_LIB/jwnl.jar.zip

##log4j-1.2.15.jar
wget -cO - http://central.maven.org/maven2/log4j/log4j/1.2.15/log4j-1.2.15.jar >> $TMP_LIB/log4j-1.2.15.jar

##log4j-1.2-api-2.7.jar
wget -cO - http://central.maven.org/maven2/org/apache/logging/log4j/log4j-1.2-api/2.7/log4j-1.2-api-2.7.jar >> $TMP_LIB/log4j-1.2-api-2.7.jar

##log4j-api-2.7.jar
wget -cO - http://central.maven.org/maven2/org/apache/logging/log4j/log4j-api/2.7/log4j-api-2.7.jar >> $TMP_LIB/log4j-api-2.7.jar

##log4j-core-2.7.jar
wget -cO - http://central.maven.org/maven2/org/apache/logging/log4j/log4j-core/2.7/log4j-core-2.7.jar >> $TMP_LIB/log4j-core-2.7.jar

##lombok.jar
wget -cO - http://central.maven.org/maven2/org/projectlombok/lombok/1.16.20/lombok-1.16.20.jar >> $TMP_LIB/lombok.jar

##lucene-analyzers-common-6.3.0.jar
wget -cO - http://central.maven.org/maven2/org/apache/lucene/lucene-analyzers-common/6.3.0/lucene-analyzers-common-6.3.0.jar >> $TMP_LIB/lucene-analyzers-common-6.3.0.jar

##lucene-backwards-codecs-6.3.0.jar
wget -cO - http://central.maven.org/maven2/org/apache/lucene/lucene-backward-codecs/6.3.0/lucene-backward-codecs-6.3.0.jar >> $TMP_LIB/lucene-backward-codecs-6.3.0.jar

##lucene-core-6.3.0.jar
wget -cO - http://central.maven.org/maven2/org/apache/lucene/lucene-core/6.3.0/lucene-core-6.3.0.jar >> $TMP_LIB/lucene-core-6.3.0.jar

##lucene-grouping-6.3.0.jar
wget -cO - http://central.maven.org/maven2/org/apache/lucene/lucene-grouping/6.3.0/lucene-grouping-6.3.0.jar >> $TMP_LIB/lucene-grouping-6.3.0.jar

##lucene-highlighter-6.3.0.jar
wget -cO - http://central.maven.org/maven2/org/apache/lucene/lucene-highlighter/6.3.0/lucene-highlighter-6.3.0.jar >> $TMP_LIB/lucene-highlighter-6.3.0.jar

##lucene-join-6.3.0.jar
wget -cO - http://central.maven.org/maven2/org/apache/lucene/lucene-join/6.3.0/lucene-join-6.3.0.jar >> $TMP_LIB/lucene-join-6.3.0.jar

##lucene-memory-6.3.0.jar
wget -cO - http://central.maven.org/maven2/org/apache/lucene/lucene-memory/6.3.0/lucene-memory-6.3.0.jar >> $TMP_LIB/lucene-memory-6.3.0.jar

##lucene-misc-6.3.0.jar
wget -cO - http://central.maven.org/maven2/org/apache/lucene/lucene-misc/6.3.0/lucene-misc-6.3.0.jar >> $TMP_LIB/lucene-misc-6.3.0.jar

##lucene-queries-6.3.0.jar
wget -cO - http://central.maven.org/maven2/org/apache/lucene/lucene-queries/6.3.0/lucene-queries-6.3.0.jar >> $TMP_LIB/lucene-queries-6.3.0.jar

##lucene-queryparser-6.3.0.jar
wget -cO - http://central.maven.org/maven2/org/apache/lucene/lucene-queryparser/6.3.0/lucene-queryparser-6.3.0.jar >> $TMP_LIB/lucene-queryparser-6.3.0.jar

##lucene-sandbox-6.3.0.jar
wget -cO - http://central.maven.org/maven2/org/apache/lucene/lucene-sandbox/6.3.0/lucene-sandbox-6.3.0.jar >> $TMP_LIB/lucene-sandbox-6.3.0.jar

##lucene-spatial3d-6.3.0.jar
wget -cO - http://central.maven.org/maven2/org/apache/lucene/lucene-spatial3d/6.3.0/lucene-spatial3d-6.3.0.jar >> $TMP_LIB/lucene-spatial3d-6.3.0.jar

##lucene-spatial-6.3.0.jar
wget -cO - http://central.maven.org/maven2/org/apache/lucene/lucene-spatial/6.3.0/lucene-spatial-6.3.0.jar >> $TMP_LIB/lucene-spatial-6.3.0.jar

##lucene-spatial-extras-6.3.0.jar
wget -cO - http://central.maven.org/maven2/org/apache/lucene/lucene-spatial-extras/6.3.0/lucene-spatial-extras-6.3.0.jar >> $TMP_LIB/lucene-spatial-extras-6.3.0.jar

##lucene-suggest-6.3.0.jar
wget -cO - http://central.maven.org/maven2/org/apache/lucene/lucene-suggest/6.3.0/lucene-suggest-6.3.0.jar >> $TMP_LIB/lucene-suggest-6.3.0.jar

##markdownj-1.0.2b4-0.3.0.jar
wget -cO - http://central.maven.org/maven2/org/markdownj/markdownj/0.3.0-1.0.2b4/markdownj-0.3.0-1.0.2b4.jar >> $TMP_LIB/markdownj-1.0.2b4-0.3.0.jar

##mime-util.jar
wget -cO - http://central.maven.org/maven2/eu/medsea/mimeutil/mime-util/1.3/mime-util-1.3.jar >> $TMP_LIB/mime-util.jar

##mockito-all.jar
wget -cO - http://central.maven.org/maven2/org/mockito/mockito-all/1.9.5/mockito-all-1.9.5.jar >> $TMP_LIB/mockito-all.jar

##mtj.jar
wget -cO - http://central.maven.org/maven2/com/googlecode/matrix-toolkits-java/mtj/0.9.14/mtj-0.9.14.jar >> $TMP_LIB/mtj.jar

##netlib-java.jar
wget -cO - http://central.maven.org/maven2/com/googlecode/netlib-java/netlib-java/0.9.3/netlib-java-0.9.3.jar >> $TMP_LIB/netlib-java.jar

##opennlp-tools.jar
wget -cO - http://central.maven.org/maven2/org/apache/opennlp/opennlp-tools/1.6.0/opennlp-tools-1.6.0.jar >> $TMP_LIB/opennlp-tools.jar

##postgresql.jar
wget -cO - http://central.maven.org/maven2/org/postgresql/postgresql/42.1.4/postgresql-42.1.4.jar >> $TMP_LIB/postgresql.jar

##restfb.jar
wget -cO - http://central.maven.org/maven2/com/restfb/restfb/2.0.0/restfb-2.0.0.jar >> $TMP_LIB/restfb.jar

##schema-org-client.jar
wget -cO - https://github.com/google/schemaorg-java/blob/master/export/schema-org-client-1.0.0.jar?raw=true >> $TMP_LIB/schema-org-client.jar

##securesm-1.1.jar
wget -cO - http://central.maven.org/maven2/org/elasticsearch/securesm/1.1/securesm-1.1.jar >> $TMP_LIB/securesm-1.1.jar

##servlet-api-3.1.jar
wget -cO - http://central.maven.org/maven2/javax/servlet/javax.servlet-api/3.1.0/javax.servlet-api-3.1.0.jar >> $TMP_LIB/servlet-api-3.0.jar

##signpost-commonshttp4.jar
wget -cO - http://central.maven.org/maven2/oauth/signpost/signpost-commonshttp4/1.2.1.2/signpost-commonshttp4-1.2.1.2.jar >> $TMP_LIB/signpost-commonshttp4.jar

##signpost-core.jar
wget -cO - http://central.maven.org/maven2/oauth/signpost/signpost-core/1.2.1.2/signpost-core-1.2.1.2.jar >> $TMP_LIB/signpost-core.jar

##slf4j-api.jar
wget -cO - http://central.maven.org/maven2/org/slf4j/slf4j-api/1.7.21/slf4j-api-1.7.21.jar >> $TMP_LIB/slf4j-api.jar

##slf4j-simple-1.7.21.jar
wget -cO - http://central.maven.org/maven2/org/slf4j/slf4j-simple/1.7.21/slf4j-simple-1.7.21.jar >> $TMP_LIB/slf4j-simple-1.7.21.jar

##snakeyaml-1.15.jar
wget -cO - http://central.maven.org/maven2/org/yaml/snakeyaml/1.15/snakeyaml-1.15.jar >> $TMP_LIB/snakeyaml-1.15.jar

##snowball-stemmer-1.3.0.581.1.jar
wget -cO - http://central.maven.org/maven2/com/github/rholder/snowball-stemmer/1.3.0.581.1/snowball-stemmer-1.3.0.581.1.jar >> $TMP_LIB/snowball-stemmer-1.3.0.581.1.jar

##spatial4j-0.6.jar
wget -cO - http://central.maven.org/maven2/org/locationtech/spatial4j/spatial4j/0.6/spatial4j-0.6.jar >> $TMP_LIB/spatial4j-0.6.jar

##stripe-java.jar
wget -cO - http://central.maven.org/maven2/com/stripe/stripe-java/3.11.0/stripe-java-3.11.0.jar >> $TMP_LIB/stripe-java.jar

##tagsoup.jar
wget -cO - http://central.maven.org/maven2/org/ccil/cowan/tagsoup/tagsoup/1.2.1/tagsoup-1.2.1.jar >> $TMP_LIB/tagsoup.jar

##t-digest-3.0.jar
wget -cO - http://central.maven.org/maven2/com/tdunning/t-digest/3.0/t-digest-3.0.jar >> $TMP_LIB/t-digest-3.0.jar

##trove.jar
wget -cO - http://central.maven.org/maven2/net/sf/trove4j/trove4j/3.0.3/trove4j-3.0.3.jar >> $TMP_LIB/trove.jar

##trove-2.0.4.jar
wget -cO - http://central.maven.org/maven2/net/sf/trove4j/trove4j/2.0.4/trove4j-2.0.4.jar >> $TMP_LIB/trove-2.0.4.jar

##xmlpull-1.1.3.1.jar
wget -cO - http://central.maven.org/maven2/xmlpull/xmlpull/1.1.3.1/xmlpull-1.1.3.1.jar >> $TMP_LIB/xmlpull-1.1.3.1.jar

##xpp3_min-1.1.4c.jar
wget -cO - http://central.maven.org/maven2/xpp3/xpp3_min/1.1.4c/xpp3_min-1.1.4c.jar >> $TMP_LIB/xpp3_min-1.1.4c.jar

##xstream.jar
wget -cO - http://central.maven.org/maven2/com/thoughtworks/xstream/xstream/1.4.9/xstream-1.4.9.jar >> $TMP_LIB/xstream.jar



############################################
######## Cloning repos
############################################
cd ~
git clone https://github.com/sodash/open-code
git clone https://github.com/winterstein/sogive-app
git clone https://github.com/winterstein/elasticsearch-java-client
git clone https://github.com/winterstein/flexi-gson
git clone git@git.winterwell.com:/winterwell-code



##########Breakage is somewhere in


############################################
######## Build Utils
############################################
cd ~/open-code/winterwell.utils/src && find . -iname "*.java" -print | xargs javac -cp .:$TMP_LIB/*
cd ~/open-code/winterwell.utils/test && find . -iname "*.java" -print | xargs javac -cp .:$TMP_LIB/*
cp ~/open-code/winterwell.utils/test/com/winterwell/datalog/*.class ~/open-code/winterwell.utils/src/com/winterwell/datalog/
rsync -r ~/open-code/winterwell.utils/test/com/winterwell/utils/* ~/open-code/winterwell.utils/src/com/winterwell/utils/
cd ~/open-code/winterwell.utils/src && find . -iname "*.class" -print | xargs jar cf ~/open-code/winterwell.utils/winterwell.utils.jar
cp ~/open-code/winterwell.utils/winterwell.utils.jar $TMP_LIB/

############################################
######## Build Flexi-Gson
############################################
cd ~/flexi-gson/src && find . -iname "*.java" -print | xargs javac -cp .:$TMP_LIB/*
cd ~/flexi-gson/src && find . -iname "*.class" -print | xargs jar cf ~/flexi-gson/flexi-gson.jar
cp ~/flexi-gson/flexi-gson.jar $TMP_LIB/

############################################
######## Build Web
############################################
cd ~/open-code/winterwell.web/src && find . -iname "*.java" -print | xargs javac -cp .:$TMP_LIB/*
cd ~/open-code/winterwell.web/src && find . -iname "*.class" -print | xargs jar cf ~/open-code/winterwell.web/winterwell.web.jar
cp ~/open-code/winterwell.web/winterwell.web.jar $TMP_LIB/

#############################################
######## Build Elasticsearch-Java-Client
#############################################
cd ~/elasticsearch-java-client/src && find . -iname "*.java" -print | xargs javac -cp .:$TMP_LIB/*
cd ~/elasticsearch-java-client/src && find . -iname "*.class" -print | xargs jar cf ~/elasticsearch-java-client/elasticsearch-java-client.jar
cp ~/elasticsearch-java-client/elasticsearch-java-client.jar $TMP_LIB/

#############################################
####### Build Depot
#############################################
cd ~/open-code/winterwell.depot/src && find . -iname "*.java" -print | xargs javac -cp .:$TMP_LIB/*
cd ~/open-code/winterwell.depot/src && find . -iname "*.class" -print | xargs jar cf ~/open-code/winterwell.depot/winterwell.depot.jar
cp ~/open-code/winterwell.depot/winterwell.depot.jar $TMP_LIB/

#############################################
####### Build Bob
#############################################
cd ~/open-code/winterwell.bob/src && find . -iname "*.java" -print | xargs javac -cp .:$TMP_LIB/*
cd ~/open-code/winterwell.bob/src && find . -iname "*.class" -print | xargs jar cf ~/open-code/winterwell.bob/winterwell.bob.jar
cp ~/open-code/winterwell.bob/winterwell.bob.jar $TMP_LIB/


#############################################
####### Build Maths
#############################################
rsync -r ~/open-code/winterwell.maths/test/* ~/open-code/winterwell.maths/src/
rsync -r ~/open-code/winterwell.maths/test.utils/* ~/open-code/winterwell.maths/src/
cd ~/open-code/winterwell.maths/src && find . -iname "*.java" -print | xargs javac -cp .:$TMP_LIB/*
cd ~/open-code/winterwell.maths/src && find . -iname "*.class" -print | xargs jar cf ~/open-code/winterwell.maths/winterwell.maths.jar
cp ~/open-code/winterwell.maths/winterwell.maths.jar $TMP_LIB/

#############################################
####### Build nlp
#############################################
rsync -r ~/open-code/winterwell.nlp/test/* ~/open-code/winterwell.nlp/src/
rsync -r ~/open-code/winterwell.nlp/test.demo/* ~/open-code/winterwell.nlp/src/
rsync -r ~/open-code/winterwell.nlp/test.utils/* ~/open-code/winterwell.nlp/src/
cd ~/open-code/winterwell.nlp/src && find . -iname "*.java" -print | xargs javac -cp .:$TMP_LIB/*
cd ~/open-code/winterwell.nlp/src && find . -iname "*.class" -print | xargs jar cf ~/open-code/winterwell.nlp/winterwell.nlp.jar
cp ~/open-code/winterwell.nlp/winterwell.nlp.jar $TMP_LIB/

#############################################
####### Build Youagain-java-client
#############################################
cd ~/open-code/youagain-java-client/src && find . -iname "*.java" -print | xargs javac -cp .:$TMP_LIB/*
cd ~/open-code/youagain-java-client/src && find . -iname "*.class" -print | xargs jar cf ~/open-code/youagain-java-client/youagain-java-client.jar
cp ~/open-code/youagain-java-client/youagain-java-client.jar $TMP_LIB/

##############################################
####### Build WebAppBase
##############################################
cd ~/open-code/winterwell.webappbase/src && find . -iname "*.java" -print | xargs javac -cp .:$TMP_LIB/*
cd ~/open-code/winterwell.webappbase/src && find . -iname "*.class" -print | xargs jar cf ~/open-code/winterwell.webappbase/winterwell.webappbase.jar
cp ~/open-code/winterwell.webappbase/winterwell.webappbase.jar $TMP_LIB/

##############################################
####### Build Datalog
##############################################
cd ~/open-code/winterwell.datalog/src && find . -iname "*.java" -print | xargs javac -cp .:$TMP_LIB/*
cd ~/open-code/winterwell.datalog/src && find . -iname "*.class" -print | xargs jar cf ~/open-code/winterwell.datalog/winterwell.datalog.jar
cp ~/open-code/winterwell.datalog/winterwell.datalog.jar $TMP_LIB/

###############################################
####### Build Sogive
###############################################
cd ~/sogive-app/server/src && find . -iname "*.java" -print | xargs javac -cp .:$TMP_LIB/*
cd ~/sogive-app/server/src && find . -iname "*.class" -print | xargs jar cf ~/sogive-app/sogive.jar
cp ~/sogive-app/sogive.jar $TMP_LIB/

###############################################
##### Start the JVM to see if it runs?
###############################################
cd ~/sogive-app
/usr/lib/jvm/java-8-openjdk-amd64/jre/bin/java -ea -cp /home/winterwell/middleware/winterwell.datalog.jar:/home/winterwell/middleware/* org.sogive.server.SoGiveServer