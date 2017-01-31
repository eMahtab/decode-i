var app=angular.module('cmeProvisioning',['ui.router','ui.bootstrap','app.constants','app.factory',
    'app.service','app.controllers','toaster']);

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
        })
        .state('study', {
            url: '/study',
            templateUrl: 'provisioning_assets/templates/create_study.html',
            controller:'StudyController'
        })
        .state('physician', {
            url: '/physician',
            templateUrl: 'provisioning_assets/templates/create_physician.html',
            controller:'PhysicianController'
        })
        .state('phase', {
            url: '/phase',
            templateUrl: 'provisioning_assets/templates/create_phase.html',
            controller:'PhaseController'
        });

});
