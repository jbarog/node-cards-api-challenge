
# Node cards api challenge

Rest API for create, edit, subscribe and use cards.

## Definition

 - Use JWT token to control access
 - A card is defined by its name, image and rarity.
 - Avoid two published card with same name, image and rarity.
 - Cards can be in draft, published or deleted states.
 - Only owner have access to draft or deleted cards.
 - A user can can make subscriptions to cards.
 - A user with a subscription o a card can use it (only one use per subscription)
 - Cards can limit number of subscriptions.
 - Cards has a stats field with subscriptions and use counters. Creator statistics are absolute and subscriber has own statistics.
 - When a card is created or published should send details to two different analytics platforms.

## Solution

### DB Model

#### User
User model is out of this consideration but a simple [id, name] is implemented.

```
users
|-- id
|-- name<String> {maxlength: 128} User name
```

#### Card

```
cards
|-- id<ObjectId>
|-- name<String>       {maxlength: 128}                User name
|-- imagePath<String>  {maxlength: 128}                Card image
|-- rarity<String>     ['standard','rare']             Card rarity
|-- status<String>     ['draft','published','deleted'] Card rarity
|-- limit<Integer>                                     Card subscriptions limit (0 this means it is a regular)
|-- owner<ObjectId>                                    Owner user reference
|-- createdAt<Date>                                    Card creation date
|-- updatedAt<Date>                                    Card last update date
|-- subscriptions<Array>                               Subscriptions array
|   |- subscriber<ObjectId>                            Subscriber user reference
|   |- subscribeDate<Date>                             Subscription date
|   |- useDate<Date>                                   Subscription use date. (only if card is used)
```

### API response model

#### Card

```
cards
|-- id<ObjectId>
|-- name<String>       {maxlength: 128}                User name
|-- imagePath<String>  {maxlength: 128}                Card image
|-- rarity<String>     ['standard','rare']             Card rarity
|-- status<String>     ['draft','published','deleted'] Card rarity
|-- limit<Integer>                                     Card subscriptions limit (0 this means it is a regular)
|-- owner<Object>                                      Owner data
|   |- _id<ObjectId>                                   Owner id
|   |- name<String>                                    Owner name
|-- createdAt<Date>                                    Card creation date
|-- stats<Object>                                      Subscriptions statistics
|   |- subscribed<Integer>                             Subscriptions counter
|   |- used<Integer>                                   Subscriptions user counter
|-- subscriptions<Array>                               Subscriptions array (only for owner)
|   |- subscriber<ObjectId>                            Subscriber user reference
|   |- subscribeDate<Date>                             Subscription date
|   |- useDate<Date>                                   Subscription use date. (only if card is used)
```

### API services

#### create card
POST /v1/cards
Params:
(name, status, imagePath, rarity, limit)
*If status is 'published' (name, imagePath, rarity) are required.

#### update card
PUT /v1/cards/:idCard
Params:
(name, status, imagePath, rarity, limit)
*If status is 'published' (name, imagePath, rarity) are required.

#### get card list
GET /v1/cards
Params optional:
(page<Integer>(pagination index), perPage<Integer>(cards per page))

#### get card detail
GET /v1/cards/:idCard

#### bulk card publish
PATCH /v1/cards/publish
Params:
(cardsIds<Array>)

#### bulk card subscribe
PATCH /v1/cards/subscribe
Params:
(cardsIds<Array>)

#### bulk card use
PATCH /v1/cards/use
Params:
(cardsIds<Array>)

#### delete card
DELETE /v1/cards/:idCard

For further information please generate doc.

## Implementation path

Next two weeks path:
- Finish bulk services
- Control subscriptions on limited cards
- CI/CD github hooks (lint, test) implementation.
- Analytics services implementation (when a card is created or published)
- Delete card service.
- Performance and stress test.
 - Redis cache implementation. Sure is going to be needed
 - Redis cache invalidations.
 - If is needed Queue subscription middleware on POST, PUT, PATCH and DELETE services with SQS

### Backlog

- Image store service. Not sure if is needed
- Filter for cards (owned, by name, etc)

For actual implementation state please read TODO.md file.


## Requirements

 - [Node v7.6+](https://nodejs.org/en/download/current/) or [Docker](https://www.docker.com/)
 - [Yarn](https://yarnpkg.com/en/docs/install)

## Getting Started

#### Install dependencies:

```bash
yarn
```

#### Set environment variables:

```bash
cp .env.example .env
```

#### Add Postman library:

[Postman library](https://www.getpostman.com/collections/496f6c0e3d1dfdfad44c)
or use postman-files/cards_API.postman_collection.json file

Also needs two environments files:
- postman-files/Card_consumer_user.postman_environment.json
- postman-files/Card_creator_user.postman_environment.json


## Basic commands

### Running Locally

```bash
yarn dev
```

The data seed will be loaded on db.

### Running in Production

```bash
yarn start
```

### Lint

```bash
# lint code with ESLint
yarn lint

# try to fix ESLint errors
yarn lint:fix
```

### Test

```bash
# run all tests with Mocha
yarn test

# run integration tests
yarn test:integration

```

## Documentation

```bash
# generate and open api documentation
yarn docs
```

## Docker

```bash
# run container locally
yarn docker:dev

# run container in production
yarn docker:prod

# run tests
yarn docker:test
```

## Deploy

Set your server ip:

```bash
DEPLOY_SERVER=127.0.0.1
```

Replace my Docker username with yours:

```bash
nano deploy.sh
```

Run deploy script:

```bash
yarn deploy
```

## Final considerations

This project use as skeleton this boilerplate:
https://coveralls.io/github/danielfsousa/express-rest-es2017-boilerplate
For further information please read original skeleton_README.md file.

## License

[MIT License](README.md) - [Daniel Sousa](https://github.com/danielfsousa)
