FROM bitnami/minideb:stretch
WORKDIR /home/fluffy

RUN \
    apt-get update -y && apt-get -y upgrade && \
    apt-get install sudo -y && \
    apt-get install vim -y && \
    apt-get install wget -y

RUN \ 
    apt-get install git -y 

RUN \
    apt-get install nginx -y

RUN \
    apt-get install chromium -y    

RUN \
    wget https://dl.google.com/go/go1.12.4.linux-amd64.tar.gz && \
    tar -xzvf go1.12.4.linux-amd64.tar.gz && \
    mv go /usr/local && \
    export GOROOT=/usr/local/go && \
    export PATH=$GOPATH/bin:$GOROOT/bin:$PATH && \
    ln -s /usr/local/go/bin/* /usr/local/bin

COPY ./container /
COPY . /home/fluffy
VOLUME /home/fluffy
#     
# 
RUN \   
    useradd -m fluffy && \
    groupadd hosts && \
    usermod -a -G hosts fluffy && \
    useradd -m admin && \
    chown -R admin:admin /home/admin && \
    chown -R fluffy:fluffy /var/www/public && \
    chown fluffy:fluffy /etc/go -R 
# /home/admin/loadfluffy.sh && \

RUN \
    su fluffy && cd && \
    export GOPATH=/etc/go && \
    chown fluffy:fluffy /etc/go -R && \
    go get fluffbase.com/... && \
    su admin && cd && \
    export GOPATH=/etc/go && \
    ln -s /etc/go/bin/index /var/www/public/index.js.cgi

EXPOSE 9010
EXPOSE 80 443

