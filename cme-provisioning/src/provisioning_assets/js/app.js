var app=angular.module('cmeProvisioning',['ui.router','app.constants','app.factory','app.service','app.controllers']);

app.config(function($httpProvider){
  $httpProvider.interceptors.push('AuthInterceptor');
});

app.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('login', {
            url: '/',
            templateUrl: 'provisioning_assets/templates/login.html',
            controller:'LoginController'
        })
        .state('manage', {
            url: '/manage',
            templateUrl: 'provisioning_assets/templates/dashboard.html',
            controller:'DashboardController'
        });

});
