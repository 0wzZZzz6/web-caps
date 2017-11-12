angular.
module("municipalityContent").
component("municipalityContent", {
  templateUrl: "views/municipality/municipality.template.html"
}).
controller("municipalityController", function($scope, $http) {
  console.log(`municipality`);

  $http.get("views/municipality/municipality.json").then(function(response) {
    $scope.municipalities = response.data;
  });

});
