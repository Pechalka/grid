/** @jsx React.DOM */
var React = require('react/addons'); 
var	ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

// var Router = require('react-router');
// var Route = Router.Route;
// var Routes = Router.Routes;
// var DefaultRoute = Router.DefaultRoute;
// var NotFoundRoute = Router.NotFoundRoute;

var Grid = require('./components/Grid')

var App = {};

App.start = function () {
    React.renderComponent(
    	<Grid />
    , document.getElementById('app'));
};

module.exports = window.App = App;
