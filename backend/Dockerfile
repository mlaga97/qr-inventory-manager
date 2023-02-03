FROM php:8.0-apache

#RUN docker-php-ext-install mysqli && docker-php-ext-enable mysqli

# PostgreSQL
RUN apt-get update; \
    apt-get install -y libpq5 libpq-dev; \
    docker-php-ext-install pdo pdo_pgsql pgsql; \
    apt-get autoremove --purge -y libpq-dev; \
    apt-get clean ; \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /usr/share/doc/*

RUN a2enmod rewrite

ADD ./src /var/www/html/
