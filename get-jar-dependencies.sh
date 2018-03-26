#!/bin/bash

# Build sogive-app dependencies

###change this to 'middleware'
TMP_LIB='/tmp/sogive-app/tmp-lib/'

#Android.jar
wget -cO - https://github.com/winterstein/JTwitter/blob/master/liblocal/android-dummy.jar?raw=true >> $TMP_LIB/android.jar

#arpack_combo
wget -cO - http://repo.scalanlp.org/repo/netlib/arpack-combo/0.1/arpack-combo-0.1.jar >> $TMP_LIB/arpack_combo-0.1.jar

#bob.jar
wget -cO - https://www.winterwell.com/software/downloads/bob.jar >> $TMP_LIB/bob.jar

#bonecp
wget -cO - http://central.maven.org/maven2/com/jolbox/bonecp/0.7.1.RELEASE/bonecp-0.7.1.RELEASE.jar >> $TMP_LIB/bonecp.jar

#commons-codec
wget -cO - http://central.maven.org/maven2/commons-codec/commons-codec/1.9/commons-codec-1.9.jar >> $TMP_LIB/commons-codec.jar

#commons-collections
wget -cO - http://central.maven.org/maven2/commons-collections/commons-collections/3.2.1/commons-collections-3.2.1.jar >> $TMP_LIB/commons-collections-3.2.1.jar

#commons-fileupload
wget -cO - http://central.maven.org/maven2/commons-fileupload/commons-fileupload/1.2.1/commons-fileupload-1.2.1.jar >> $TMP_LIB/commons-fileupload-1.2.1.jar

#commons-io-2.4
wget -cO - http://central.maven.org/maven2/commons-io/commons-io/2.4/commons-io-2.4.jar >> $TMP_LIB/commons-io-2.X.jar

#commons-lang
wget -cO - http://central.maven.org/maven2/org/apache/commons/commons-lang3/3.4/commons-lang3-3.4.jar >> $TMP_LIB/commons-lang.jar

#commons-logging
wget -cO - http://central.maven.org/maven2/commons-logging/commons-logging/1.1.1/commons-logging-1.1.1.jar >> $TMP_LIB/commons-logging.jar

#commons-math3
wget -cO - http://central.maven.org/maven2/org/apache/commons/commons-math3/3.6.1/commons-math3-3.6.1.jar >> $TMP_LIB/commons-math3.jar

#commons-net
wget -cO - http://central.maven.org/maven2/commons-net/commons-net/3.2/commons-net-3.2.jar >> $TMP_LIB/commons-net.jar

#dnsjava -- not sure which version
wget -cO - http://central.maven.org/maven2/dnsjava/dnsjava/2.1.8/dnsjava-2.1.8.jar >> $TMP_LIB/dnsjava.jar

#ejb3-persistence
wget -cO - http://central.maven.org/maven2/org/hibernate/ejb3-persistence/1.0.2.GA/ejb3-persistence-1.0.2.GA.jar >> $TMP_LIB/ejb3-persistence.jar

#elasticsearch-5.1.2.jar
wget -cO - http://central.maven.org/maven2/org/elasticsearch/elasticsearch/5.1.2/elasticsearch-5.1.2.jar >> $TMP_LIB/elasticsearch-5.1.2.jar

#gson-original.jar
wget -cO - http://central.maven.org/maven2/com/google/code/gson/gson/2.2.4/gson-2.2.4.jar >> $TMP_LIB/gson-original.jar

#guava.jar
wget -cO - http://central.maven.org/maven2/com/google/guava/guava/21.0/guava-21.0.jar >> $TMP_LIB/guava.jar

#HdrHistogram-2.1.6.jar
wget -cO - http://central.maven.org/maven2/org/hdrhistogram/HdrHistogram/2.1.6/HdrHistogram-2.1.6.jar >> $TMP_LIB/HdrHistogram-2.1.6.jar

#hppc-0.7.1.jar
wget -cO - http://central.maven.org/maven2/com/carrotsearch/hppc/0.7.1/hppc-0.7.1.jar >> $TMP_LIB/hppc-0.7.1.jar

#httpclient-4.X.jar
wget -cO - http://central.maven.org/maven2/org/apache/httpcomponents/httpclient/4.1.2/httpclient-4.1.2.jar >> $TMP_LIB/httpclient-4.X.jar

#httpclient-cache-4.X.jar
wget -cO - http://central.maven.org/maven2/org/apache/httpcomponents/httpclient-cache/4.1.2/httpclient-cache-4.1.2.jar >> $TMP_LIB/httpclient-cache-4.X.jar

#httpcore-4.X.jar
wget -cO - http://central.maven.org/maven2/org/apache/httpcomponents/httpcore/4.1.2/httpcore-4.1.2.jar >> $TMP_LIB/httpcore-4.X.jar

#httpmime-4.X.jar
wget -cO - http://central.maven.org/maven2/org/apache/httpcomponents/httpmime/4.1.2/httpmime-4.1.2.jar >> $TMP_LIB/httpmime-4.X.jar

#jackson-core-2.8.1.jar
wget -cO - http://central.maven.org/maven2/com/fasterxml/jackson/core/jackson-core/2.8.1/jackson-core-2.8.1.jar >> $TMP_LIB/jackson-core-2.8.1.jar

#jackson-dataformat-cbor-2.8.1.jar
wget -cO - http://central.maven.org/maven2/com/fasterxml/jackson/dataformat/jackson-dataformat-cbor/2.8.1/jackson-dataformat-cbor-2.8.1.jar >> $TMP_LIB/jackson-dataformat-cbor-2.8.1.jar

#jackson-dataformat-smile-2.8.1.jar
wget -cO - http://central.maven.org/maven2/com/fasterxml/jackson/dataformat/jackson-dataformat-smile/2.8.1/jackson-dataformat-smile-2.8.1.jar >> $TMP_LIB/jackson-dataformat-smile-2.8.1.jar

#jackson-dataformat-yaml-2.8.1.jar
wget -cO - http://central.maven.org/maven2/com/fasterxml/jackson/dataformat/jackson-dataformat-yaml/2.8.1/jackson-dataformat-yaml-2.8.1.jar >> $TMP_LIB/jackson-dataformat-yaml-2.8.1.jar

#java2html.jar
wget -cO - http://central.maven.org/maven2/de/java2html/java2html/5.0/java2html-5.0.jar >> $TMP_LIB/java2html.jar

#javax.mail.jar
wget -cO - http://central.maven.org/maven2/com/sun/mail/javax.mail/1.5.5/javax.mail-1.5.5.jar >> $TMP_LIB/javax.mail.jar

#javax.servlet-api.jar
wget -cO - http://central.maven.org/maven2/javax/servlet/javax.servlet-api/3.1.0/javax.servlet-api-3.1.0.jar >> $TMP_LIB/javax.servlet-api.jar

#jetty-continuation.jar
wget -cO - http://central.maven.org/maven2/org/eclipse/jetty/jetty-continuation/8.1.3.v20120416/jetty-continuation-8.1.3.v20120416.jar >> $TMP_LIB/jetty-continuation.jar

#jetty-http.jar
wget -cO - http://central.maven.org/maven2/org/eclipse/jetty/jetty-http/9.4.8.v20171121/jetty-http-9.4.8.v20171121.jar >> $TMP_LIB/jetty-http.jar

#jetty-io.jar
wget -cO - http://central.maven.org/maven2/org/eclipse/jetty/jetty-io/9.4.8.v20171121/jetty-io-9.4.8.v20171121.jar >> $TMP_LIB/jetty-io.jar

#jetty-security.jar
wget -cO - http://central.maven.org/maven2/org/eclipse/jetty/jetty-security/9.4.8.v20171121/jetty-security-9.4.8.v20171121.jar >> $TMP_LIB/jetty-security.jar

#jetty-server.jar
wget -cO - http://central.maven.org/maven2/org/eclipse/jetty/jetty-server/9.4.8.v20171121/jetty-server-9.4.8.v20171121.jar >> $TMP_LIB/jetty-server.jar

#jetty-servlet.jar
wget -cO - http://central.maven.org/maven2/org/eclipse/jetty/jetty-servlet/9.4.8.v20171121/jetty-servlet-9.4.8.v20171121.jar >> $TMP_LIB/jetty-servlet.jar

#jetty-util.jar
wget -cO - http://central.maven.org/maven2/org/eclipse/jetty/jetty-util/9.4.8.v20171121/jetty-util-9.4.8.v20171121.jar >> $TMP_LIB/jetty-util.jar

#jetty-util-ajax.jar
wget -cO - http://central.maven.org/maven2/org/eclipse/jetty/jetty-util-ajax/9.4.8.v20171121/jetty-util-ajax-9.4.8.v20171121.jar >> $TMP_LIB/jetty-util-ajax.jar

#jetty-websocket.jar
wget -cO - http://central.maven.org/maven2/org/eclipse/jetty/jetty-websocket/8.1.13.v20130916/jetty-websocket-8.1.13.v20130916.jar >> $TMP_LIB/jetty-websocket.jar


