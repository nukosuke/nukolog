'use strict';
var BaseController = require('./base-controller');

module.exports = class ApiUserController extends BaseController {
  constructor(app) {
    super(app);
    this.middlewares._.bindAll(this, 'index', 'show', 'token')
  }

  index(req, res) {
    this.models.User.findAll()
    .then(users => res.json({ users }));
  }

  show(req, res) {
    this.models.User
    .findOne({ where: { uid: req.params.uid } })
    .then(user => {
      if(!user) {
        return res
        .status(this.middlewares.httpStatus.NOT_FOUND)
        .json({ user: {} });
      }
      return res
      .status(this.middlewares.httpStatus.OK)
      .json({ user });
    });
  }

  /**
   * authenticate and publish JWT
   */
  token(req, res, next) {
    var authenticator = this.middlewares.authenticator;
    authenticator.local(req, res, next);
  }
}
