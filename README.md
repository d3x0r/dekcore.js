# Dekcore

MUD enironment/JS REPL.

connect to port specified.   Use commands.

Internally Entities are created and tracked by the core.

[Heroku Deployment](https://dekware.herokuapp.com/) 

Entities which have wareness are isolated into worker threads, and have a 'view' of the common core state, or may query the core for the state directly. 
Events are dispatched as entity relationships are changed so that observers can be notified of said changes;
When the changes happen, the internal view of the objects can be updated.  The current environment is really just what the entity knows already or has a reference of, or
those things which are percievable by looking.

Entities are within other entities.  The current container can be accessed with `within`; which returns a promise which resolves with a entity reference of the current room.  
Entities may also be attached to each other; only one entity of an attached chain has a container; although any entity may consult all attachments to find the container.

The basic commands `/create <entity>` will create a thing called the name provided.

 - /help - show list of commands.
 - /look - looks around the current entity, and returns things which are immediately visible.  Visible entities are the room the entity is in (unless it's an attachment, which can only see those things which are also attached)
   - /look in <thing> - looks at the contents of an object
   - /look on <thing> - show the attached things to some object
 - /inv
 - /create
 - /grab <thing> - finds specified entity within the current entity, and attempts to take it out, and attach it to the current entity.  
 - /store <thing> - finds an attached entity, detaches it and stores it in the current entity.
   - /store <thing> in <other thing> - put attached item into some other visible item.
 - /attach <thing> [to] <other thing> - for two objects which are currently held by (attached to) the current object, attach the first item to the second item, leaving the second item as the root entity. `to` is an option preposition.
 - /detach <thing> [from] <other thing> - for an object and another object which is also attached to it, detach the <thing> from the other thing;  `from` is an optional preposition.
  

## Running

(Tenative, in-dev)

This has a 2 stage startup; the first run intiializes some identifiers, which are required to reload.

```
node ./void-firstrun.js
```

After the first run, use nextrun.js to reload the existing system.

```
node ./void-nextrun.js
```


## Object Storage

Objects are stored with the code that they have run the first time, so when they are restored, they recover exactly the image they were running before.
Objects can also store data records associated with themselves as 'value' (?).

## Design notes

Many places getters are used instead of functions with empty parameters.  Getters in the running object environments all return promises and must be resolved to get their value.

```
within.then(within=>within.name.then(name=>console.log( "I am within:", name ) ) );
```


































---

# node-js-getting-started

A barebones Node.js app using [Express 4](http://expressjs.com/).

This application supports the [Getting Started on Heroku with Node.js](https://devcenter.heroku.com/articles/getting-started-with-nodejs) article - check it out.

## Running Locally

Make sure you have [Node.js](http://nodejs.org/) and the [Heroku CLI](https://cli.heroku.com/) installed.

```sh
$ git clone https://github.com/heroku/node-js-getting-started.git # or clone your own fork
$ cd node-js-getting-started
$ npm install
$ npm start
```

Your app should now be running on [localhost:5000](http://localhost:5000/).

## Deploying to Heroku

```
$ heroku create
$ git push heroku main
$ heroku open
```
or

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## Documentation

For more information about using Node.js on Heroku, see these Dev Center articles:

- [Getting Started on Heroku with Node.js](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- [Heroku Node.js Support](https://devcenter.heroku.com/articles/nodejs-support)
- [Node.js on Heroku](https://devcenter.heroku.com/categories/nodejs)
- [Best Practices for Node.js Development](https://devcenter.heroku.com/articles/node-best-practices)
- [Using WebSockets on Heroku with Node.js](https://devcenter.heroku.com/articles/node-websockets)
