angular.
module("toolBar").
component("toolBar", {
  templateUrl: "views/toolbar/toolbar.template.html"
}).
controller("toolbarController", function($scope, $mdSidenav, $mdDialog) {

  $scope.toggleSideNav = function() {
    $mdSidenav('left').toggle();
  }

  $scope.closeSideNav = function() {
    $mdSidenav('left').close();
  }

  $scope.showAdvanced = function(ev) {
    $mdDialog.show({
      templateUrl: 'views/dialog/sample.dialog.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
    })
    .then(function(answer) {
      $scope.status = 'You said the information was "' + answer + '".';
    }, function() {
      $scope.status = 'You cancelled the dialog.';
    });
  }
});
