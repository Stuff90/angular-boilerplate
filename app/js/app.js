(function(){

    'use strict';

    angular.module('ileotech', [
        'ui.router',

        'ileotech.translation',
        'ileotech.index',

    ]).config([  '$urlRouterProvider' , '$translateProvider' , '$locationProvider' , ileotechModuleConfig ]);

    function ileotechModuleConfig ( $urlRouterProvider , $translateProvider , $locationProvider ) {
        console.info('Here come the sun !');

        $urlRouterProvider.otherwise('/');
        $locationProvider.html5Mode(true);
        $translateProvider.preferredLanguage('en');
        $translateProvider.useSanitizeValueStrategy('escapeParameters');
    }
})();