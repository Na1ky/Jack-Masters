#!/bin/sh
set -e

# On Render (and similar PaaS) the platform sets $PORT at runtime.
# Apache must listen on that port; default to 80 for local Docker use.
PORT="${PORT:-80}"

# Replace the default port in Apache's port and vhost configuration
sed -i "s/Listen 80/Listen ${PORT}/" /etc/apache2/ports.conf
sed -i "s/<VirtualHost \*:80>/<VirtualHost *:${PORT}>/" \
    /etc/apache2/sites-available/000-default.conf

exec "$@"
