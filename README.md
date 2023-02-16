# quotes-fullstack-app
Small full-stack app which gets random authors and quotes from the server and allows to add new quotes. With authorization.

To start use the app, first - create local PostgreSQL database.
Then - add DB credentials to dev config. Address of config:
````
/server/config/config.json
````
and to
````
/server/config/default.json
````
Then, type in the root:
````
yarn dependencies && yarn server:build
````
and then
````
yarn start
````

EER schema in the backend app:

+-----------------+							                    +-----------------+
|     User        |							                    |     Token       |
+-----------------+	   <- One token belongs to one user (1:1)	+-----------------+
| -id             | ------------------------------------\		| -id             |              
| -email          | One user can have many tokens (1:N)  \		| -token          |
| -password       |		      ->			              \_____| -userId (FK)    |
| -fullname       |							                    +-----------------+
+-----------------+


+-----------------+							                        +-----------------+
|     Author      |							                        |     Quote       |
+-----------------+	   <- One quote belongs to one author (1:1)	    +-----------------+
| -id             | -------------------------------------\         	| -id             |
| -name           | One author can have many quotes (1:N) \		    | -text           |
+-----------------+			->       	                   \________| -authorId (FK)  |
+-----------------+
