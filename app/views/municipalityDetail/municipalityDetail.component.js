angular.
module("municipalityDetail").
component("municipalityDetail", {
  templateUrl: "views/municipalityDetail/municipalityDetail.template.html"
}).
controller("municipalityDetailController", function($scope, $firebaseArray, $routeParams, $mdDialog) {


  $scope.municipalityId = $routeParams.municipalityId;

  console.log("municipality detail - " + $scope.municipalityId);
  $scope.categories = ['Show All', 'Landmark', 'Accommodation', 'Food', 'Recreation'];
  $scope.selected = [];
  $scope.options = {
    rowSelection: true,
    multiSelect: false,
    autoSelect: true,
    decapitate: false,
    largeEditDialog: false,
    boundaryLinks: false,
    limitSelect: false,
    pageSelect: true
  };
  $scope.query = {
    order: 'name',
    limit: 5,
    page: 1
  };
  var last = {
    bottom: true,
    top: false,
    left: false,
    right: true
  }

  var ref = firebase.database().ref("municipality/" + $scope.municipalityId);
  $scope.items = $firebaseArray(ref);

  $scope.selectCatergory = function() {
    console.log(`${$scope.selectedCategories}`);
    if ($scope.selectedCategories == 'Show All') {
      console.log(`show all..`);
      $scope.selectedCategories = '';
    }

  }

  $scope.select = function(item){
    console.log(item.category);
  }

  $scope.add = function(ev) {
    $mdDialog.show({
      controller: "municipalityDetailDialogController",
      templateUrl: "views/dialog/municipality/municipalityDetailDialog.template.html",
      parent: angular.element(document.body),
      targetEvent: ev,
      escapeToClose: false,
      fullscreen: true,
      locals: {
        tab: $scope.tab,
        municipality: $scope.municipalityId
      }
    });
  }

});
