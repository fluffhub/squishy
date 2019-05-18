FROM bitnami/minideb:stretch
WORKDIR /home/fluffy

RUN \
    useradd -m fluffy && \
    groupadd hosts && \
    usermod -a -G hosts fluffy && \
    apt-get update -y && \
    apt-get install apache2 -y && \
    apt-get install apache2-suexec-custom && \
    apt-get install golang -y

RUN \
    apt-get install vim -y && \
    apt-get install sudo -y
    
RUN \ 
    apt-get install git -y 

COPY ./fluffbase/container /
COPY . /home/fluffy
VOLUME /home/fluffy

ENV RUNTIME_ENV=local \
    DEBUG=1 \  
    POSTGRES_URI=postgres://fluffbase:fluffbase@postgres/fluffbase \
    APACHE_MODULES=/var/www/modules \
    APACHE_RUN_USER=fluffy \
    APACHE_RUN_GROUP=hosts
    
RUN \
    a2enmod ssl && \
    a2enmod suexec && \
    a2enmod userdir && \
    a2enmod cgid && \
    a2enmod proxy_wstunnel && \
    a2enmod rewrite && \
    a2ensite 001-fluffy && \
    a2dissite 000-default && \
    apachectl restart && \
    touch /home/fluffy/error.log && \
    touch /home/fluffy/access.log && \
    useradd -m admin && \
    chown -R admin:admin /home/admin && \
    chown -R fluffy:fluffy /var/www/public && \
    su admin && cd && \
    export GOPATH=/var/www/go && \
    go get github.com/google/shlex && \
    go get github.com/gorilla/websocket && \
    go get github.com/kr/pty && \
    go install fluffbase.com/hostess && \
    go install fluffbase.com/membrane

RUN \
    chown fluffy:fluffy /var/www/go -R && \
    chown root:hosts /usr/lib/apache2/suexec-custom && \
    chmod 4710 /usr/lib/apache2/suexec-custom && \
    chown fluffy:hosts /var/log/apache2 -R 
    

RUN \
    su admin && cd && \
    /home/admin/loadfluffy.sh

RUN \
    su fluffy && cd && \
    export GOPATH=/var/www/go && \
    go install fluffbase.com/index && \
    chown fluffy:fluffy /var/www/go -R && \
    ln -s /var/www/go/bin/index /var/www/public/index.js.cgi 

RUN \
    apachectl restart

# Git version embedding
ARG FLUFFBASE_VERSION
ENV FLUFFBASE_VERSION=${FLUFFBASE_VERSION:-git}

EXPOSE 9010
EXPOSE 80 443

