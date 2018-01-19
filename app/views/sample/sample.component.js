angular.
module("sampleContent").
component("sampleContent", {
  templateUrl: "views/sample/sample.template.html"
}).
controller("sampleController", function($scope, $routeParams, $firebaseStorage, $firebaseArray, $element) {

  $scope.mode = $routeParams.mode;
  $scope.itemId = $routeParams.itemId;

  console.log(`${$scope.mode} ${$scope.itemId}`);


  if ($scope.mode == "edit"){
    var ref = firebase.database().ref(`events`);
    $scope.eventDatabase = $firebaseArray(ref);
    $scope.eventDatabase.$loaded().then(function (event) {
        var event = $scope.eventDatabase.$getRecord($scope.itemId);
        $scope.title = event.title;
    });


    $scope.vegetables = ['Corn' ,'Onions' ,'Kale' ,'Arugula' ,'Peas', 'Zucchini'];
    $scope.searchTerm;
    $scope.clearSearchTerm = function() {
      $scope.searchTerm = '';
    };
    // The md-select directive eats keydown events for some quick select
    // logic. Since we have a search input here, we don't need that logic.
    $element.find('input').on('keydown', function(ev) {
      ev.stopPropagation();
    });
  }


});
