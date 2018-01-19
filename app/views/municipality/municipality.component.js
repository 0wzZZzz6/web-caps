angular.
module("municipalityContent").
component("municipalityContent", {
  templateUrl: "views/municipality/municipality.template.html"
}).
controller("municipalityController", function($scope, $rootScope, $http) {
  console.log(`municipality`);

  $http.get("views/municipality/municipality.json").then(function(response) {
    $scope.municipalities = response.data;
  });

  $scope.setSelectedIndex = function() {
    $rootScope.selectedIndex = 0;
  }

});
