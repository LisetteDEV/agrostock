FROM php:8.4-cli

RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libpng-dev libonig-dev libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql zip gd mbstring

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .

# Remove any locally-generated cache files so Render env vars are always used
RUN rm -f bootstrap/cache/config.php bootstrap/cache/routes.php bootstrap/cache/services.php bootstrap/cache/packages.php

RUN composer install --optimize-autoloader --no-dev --no-interaction

EXPOSE 8080
# At runtime: clear any residual cache, run migrations, rebuild config from Render env vars, then serve
CMD php artisan config:clear && php artisan route:clear && php artisan migrate --force && php artisan db:seed --class=AdminSeeder --force && php artisan db:seed --class=CategorieSeeder --force && php artisan config:cache && php artisan serve --host=0.0.0.0 --port=8080