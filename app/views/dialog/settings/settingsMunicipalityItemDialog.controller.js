angular.
module("capstone-web").
controller("settingsMunicipalityItemController", function($scope, $http, $firebaseArray, $mdToast, $mdDialog, $timeout) {
  var ref = firebase.database().ref();
  $scope.categories = $firebaseArray(ref.child('settings/category'));

  $scope.newField = {};
  $scope.category = {};
  $scope.editing = false;


  $scope.edit = function(category) {
    $scope.editing = $scope.categories.indexOf(category);
    $scope.newField = angular.copy(category);

    console.log($scope.editing);
  }

  $scope.saveField = function(index) {
    console.log($scope.category.name);
  };

  $scope.cancel = function(index) {
    if ($scope.editing !== false) {
      $scope.categories[$scope.editing] = $scope.newField;
      $scope.editing = false;
    }
  };




  $scope.addNewCategory = function(ev) {
    $scope.categories.$add({
      name: $scope.newCategory
    }).then(function(categories) {
      var id = categories.key;
      $scope.newCategory = "";
      console.log(`[ADDED] record with id: ${id}`);
      $scope.toast(`New category successfully added.`);
    });
  };

  $scope.delete = function(category) {
    $scope.categories.$remove(category);
  };

  $scope.toast = function(text) {
    var last = {
      bottom: true,
      top: false,
      left: false,
      right: true
    };

    $scope.toastPosition = angular.extend({}, last);

    $scope.getToastPosition = function() {
      sanitizePosition();
      return Object.keys($scope.toastPosition)
      .filter(function(pos) {
        return $scope.toastPosition[pos];
      })
      .join(" ");
    };

    function sanitizePosition() {
      var current = $scope.toastPosition;
      if ( current.bottom && last.top ) current.top = false;
      if ( current.top && last.bottom ) current.bottom = false;
      if ( current.right && last.left ) current.left = false;
      if ( current.left && last.right ) current.right = false;
      last = angular.extend({},current);
    }

    var pinTo = $scope.getToastPosition();
    $mdToast.show(
      $mdToast.simple()
      .textContent(text)
      .position(pinTo)
      .hideDelay(3000)
    );
  }

  $scope.closeDialog = function() {
    $mdDialog.hide();
  };

});
