const authentication = require('@feathersjs/authentication');
const jwt = require('@feathersjs/authentication-jwt');
const local = require('@feathersjs/authentication-local');

const UserVerifier = require('./UserVerifier');

module.exports = function (app) {
  const config = app.get('authentication');
  config.Verifier = UserVerifier;

  // Set up authentication with the secret
  app.configure(authentication(config));
  app.configure(jwt({
    Verifier: UserVerifier,
  }));
  app.configure(local());

  // The `authentication` service is used to create a JWT.
  // The before `create` hook registers strategies that can be used
  // to create a new valid JWT (e.g. local or oauth2)
  app.service('authentication').hooks({
    before: {
      create: [
        authentication.hooks.authenticate(config.strategies)
      ],
      remove: [
        authentication.hooks.authenticate('jwt')
      ]
    },
    after: {
      create: [
        hook => {
          if (hook.params.payload) {
            delete hook.params.user;
            hook.params.payload.user = hook.params.user
          }
        }
      ]
    }
  });
};
