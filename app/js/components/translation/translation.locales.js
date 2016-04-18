angular.module("ileotech.translate.locales", []).config(["$translateProvider", function($translateProvider) {
$translateProvider.translations("en", {
    "CATCHLINE": "The digital studio conceiving and developing innovative web appplications",
    "CATCHLINE_SUB": "Long story short, we made the web fun"
});

$translateProvider.translations("fr", {
    "CATCHLINE": "Studio de dev digital dédié à la conception et à la réalisation de projets innovants",
    "CATCHLINE_SUB": "En clair on fait du web"
});
}]);
