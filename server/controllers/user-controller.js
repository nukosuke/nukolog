'use strict';
var BaseController = require('./base-controller');
var HttpStatus     = require('http-status');
var jwt            = require('jsonwebtoken');

/**
 * UserController
 */
module.exports = class UserController extends BaseController {
  constructor(models) {
    super(models);
    this.apiIndex = this.apiIndex.bind(this);
  }

  index(req, res) {
    return res.render('users/index', { title: 'users' });
  }

  authenticate(req, res) {
    return res.render('users/authenticate', { title: 'welcome to loq!' });
  }

  show(req, res) {
    return res.render('users/show', { title: 'users' });
  }

  settings(req, res) {
    return res.render('users/settings', { title: 'user settings'});
  }

  /**
   * API: authenticate and publish JWT
   *TODO: move to api-user-controller.js
   */
  token(req, res, next) {
    var config    = req.app.get('config');
    var jwtConfig = config.authentication.JWT;
    var passport  = req.app.get('passport');

    //FIXME: too much logic in controller!
    passport.authenticate('local', function(err, user, info) {
      if (err) {
        return res.json(err);
      }

      if (!user) {
        return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({
          status: HttpStatus.UNAUTHORIZED,
          message: HttpStatus[HttpStatus.UNAUTHORIZED]
        });
      }

      //TODO: remove unneccesary value from user and add JWT optionals in Strategy
      jwt.sign(user.toJSON(), jwtConfig.secretOrKey, jwtConfig.options, function(err, token) {
        if (err) {
          return res
          .status(HttpStatus.UNAUTHORIZED)
          .json({
            status: HttpStatus.UNAUTHORIZED,
            message: HttpStatus[HttpStatus.UNAUTHORIZED]
          });
        }
        return res.json({
          status: HttpStatus.OK,
          message: HttpStatus[HttpStatus.OK],
          JWT: token,
        });
      });
    })(req, res, next);
  }

  /**
   * TODO: move into api-user-controller as index()
   */
  apiIndex(req, res) {
    this.models.User.findAll().then(function(users) {
      res.json({users});
    });
  }

  /**
   * authentication hook
   *TODO: move to middlewares/authenticator.js
   */
  requireJWT(req, res, next) {
    var passport  = req.app.get('passport');
    passport.authenticate('jwt', { session: false })(req, res, next);
  }

  /**
   * TODO:
   */
  authProviderRedirect(req, res, next) {}
  authProviderCallback(req, res, next) {}
};
