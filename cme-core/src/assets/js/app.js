var app=angular.module('cmeCore',['ui.router','app.constants','app.factory','app.service','app.controllers']);

app.config(function($httpProvider){
  $httpProvider.interceptors.push('AuthInterceptor');
});

app.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('login', {
            url: '/',
            templateUrl: 'assets/templates/login.html',
            controller:'LoginController'
        })
        .state('tasks', {
            url: '/tasks',
            templateUrl: 'assets/templates/physician_task.html',
            controller:'PhysicianTaskController'
        });

});