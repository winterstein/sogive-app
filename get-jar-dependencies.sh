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

