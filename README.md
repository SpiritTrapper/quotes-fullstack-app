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

EER schema of db is in:
````
/server/EERschema.txt
````
