FROM php:8.2-apache

# Install PHP extensions required by the app
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Copy Apache virtual-host configuration
COPY apache.conf /etc/apache2/sites-available/000-default.conf

# Copy and prepare the entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Copy application source into the web root
COPY . /var/www/html/

# Remove deployment-only files that were included by the COPY above
RUN rm -f /var/www/html/Dockerfile \
    /var/www/html/docker-entrypoint.sh \
    /var/www/html/docker-compose.yml \
    /var/www/html/apache.conf \
    /var/www/html/render.yaml \
    /var/www/html/.dockerignore

# Fix file ownership
RUN chown -R www-data:www-data /var/www/html

# Render (and other PaaS) injects $PORT at runtime; default to 80 locally
EXPOSE 80

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["apache2-foreground"]

