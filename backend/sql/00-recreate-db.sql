-- DEV ONLY - Comment out for keeping db between restart
DROP DATABASE IF EXISTS app_db WITH (FORCE);
DROP USER IF EXISTS app_user;

-- DEV ONLY - for quick iteration
CREATE USER app_user PASSWORD 'app_pwd_to_change';
CREATE DATABASE app_db owner app_user ENCODING = "UTF-8";
