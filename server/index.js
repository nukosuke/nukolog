'use strict';
var express    = require('express');
var bodyParser = require('body-parser');
var passport   = require('passport');
var Sequelize  = require('sequelize');
var log4js     = require('log4js');
var app = express();

//TODO: wrap into Server and ApiServer

/**
 * mode
 */
var mode = process.env.NODE_ENV || 'development';

/**
 * load configuration files
 */
var config = {
  //config:         require('../config/config'),
  logger:         require('../config/logger'),
  database:       require('../config/database'),
  authentication: require('../config/authentication'),
};
app.set('config', config);

/**
 * create logger
 */
log4js.configure(config.logger);
var logger = log4js.getLogger();

/**
 * middleware
 * configuration
 */
app.use(log4js.connectLogger(logger, { level: 'auto' }));
app.enable('strict routing');
app.use('/assets', express.static(__dirname + '/../public/assets'));
app.use('/favicon.ico', express.static(__dirname + '/../public/favicon.ico'))
app.use('/robots.txt', express.static(__dirname + '/../public/robots.txt'))
app.set('views', __dirname+'/views');
app.set('view engine', 'pug');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());

/**
 * authentication
 * configuration
 */
var httpStatus = require('http-status');
var _ = Sequelize.Utils._;
var Authenticator = require('./middlewares/authenticator');
var authenticator = new Authenticator(app, passport);

var middlewares = {
  httpStatus,
  _,
  authenticator,
};
app.set('middlewares', middlewares);

/**
 * define model schemas
 */
var sequelize = new Sequelize(config.database[mode]);
var models = {
  User:    require('./models/user')(sequelize, Sequelize),
  Article: require('./models/article')(sequelize, Sequelize),
};
_(models).each(model => model.associate(models));
app.set('models', models);

/**
 * create controller
 * instances
 */
var c = require('./controllers');
var controllers = {
  page:    new c.PageController(app),
  user:    new c.UserController(app),
  article: new c.ArticleController(app),
  admin:   new c.AdminController(app),
  api: {
    user:    new c.ApiUserController(app),
    article: new c.ApiArticleController(app),
  },
};
app.set('controllers', controllers);

/**
 * routing middleware
 * configuration
 */
var Routes = require('./routes');
_(Routes).each(Route => {
  var route = new Route(controllers, middlewares);
  app.use(route);
});

app.listen(process.env.PORT || 3000);
