# Partimap


## Setup

1. Install MySQL and Node v12+.
2. Create a new project in [Google reCAPTCHA](https://www.google.com/recaptcha/admin).
3. Create a MySQL database and a user for it:
	```sql
	CREATE DATABASE partimap CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

	CREATE USER 'partimap_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your strong password here';
	-- or in case of MySQL v5:
	CREATE USER 'partimap_user'@'localhost' IDENTIFIED BY 'your strong password here';

	GRANT ALL PRIVILEGES ON partimap.* TO 'partimap_user'@'localhost';
4. Copy `.env.example` to `.env` and edit the app's configuration. At a minimum, you need to set these:
	```ini
	DB_USER=partimap_user
	DB_PASS=your strong password here
	DB_NAME=partimap
	RECAPTCHA_SITE_KEY=copy value here from recaptcha admin
	RECAPTCHA_SECRET_KEY=copy value here from recaptcha admin
5. Open a terminal in the project directory and install dependencies with `npm i`.
6. Run database migrations with `npx db-migrate up`, this will create the tables of the project.
7. In MySQL add an admin user for the project:
	```sql
	INSERT INTO user (email, password, name, registered, isAdmin, active)
	VALUES ("admin@partimap.eu", "$2a$12$TwohCgZc1t7.pwX84CXZ..R9a3vIM5qWb5RaqcJZokUCNEjmLxXBq", "Admin", 0, 1, 1);
8. Run dev server with `npm run dev`.
9. Login (`/login`) with username "admin@partimap.eu" and password "123", then change admin password. :)


## Setup production

1. Do all of the above, and make sure to set all relevant fields in .env to match your environment, see `.env.example`.
2. Build the application with `npm run build`.

You can start the production server with `npm start`, or you can set it up as a service and run it in cluster mode with the following steps:

1. Install PM2 process manager with `npm i -g pm2`.
2. Set it up as a service (to start on boot) with `pm2 startup`.
3. Copy `ecodystem.config.js.example` to `ecosystem.config.js` and edit the app name and other options as you wish.
4. Start the production server with `pm2 start ecosystem.config.js`


## Adding a database change (migration)

1. Run `npx db-migrate create <name-of-migration>`.
2. This will create `migrations/sqls/<timestamp>-<name-of-migration>-<up|down>.sql` files.
3. Edit them so `*-up.sql` contains the SQL command of your migration, while `*-down.sql` contains the command to undo it. SQL files cannot contain more than one command.


## License

GPLv3, please see the `LICENSE` file for details.

*Copyright (C) 2021 DeepData Ltd.*
