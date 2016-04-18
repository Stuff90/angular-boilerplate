(function(){

    'use strict';

    angular.module('ileotech.index', ['sn.skrollr' ,
            'radial.animated.background' , 'skrollr.event.manager' ,
            'ileotech.mobile' , 'ileotech.tablet' , 'ileotech.desktop' ])
        .config([ '$stateProvider' , 'snSkrollrProvider' , ileotechModuleConfig ])
        .run([ 'snSkrollr' , 'skrollrEventManagerService' , '$rootScope' , ileotechModuleRun ]);

    function ileotechModuleConfig ( $stateProvider , snSkrollrProvider ) {
        snSkrollrProvider.config = { smoothScrolling: true };

        $stateProvider
            .state('index', {
                url: '/',
                views: {
                    'main': {
                        controller: 'IndexController',
                        templateUrl:'/app/js/components/index/index.template.html',
                    },
                    'mobile@index': {
                        controller: 'MobileController',
                        templateUrl:'/app/js/components/mobile/mobile.template.html',
                    },
                    'tablet@index': {
                        controller: 'TabletController',
                        templateUrl:'/app/js/components/tablet/tablet.template.html',
                    },
                    'desktop@index': {
                        controller: 'DesktopController',
                        templateUrl:'/app/js/components/desktop/desktop.template.html',
                    },
                }
            });
    }

    function ileotechModuleRun ( snSkrollr , skrollrEventManagerService , $rootScope ) {

        snSkrollr.init({
            render: function(data) {
                $rootScope.$broadcast('scroll:update' , data );
            },
            keyframe: function(element, name, direction) {
                skrollrEventManagerService.referenceReachEvent(element, name, direction);
            }
        });
    }

})();