angular.
module("eventContent").
component("eventContent", {
  templateUrl: "views/event/event.template.html"
}).
controller("eventController", function($scope, $firebaseArray, $firebaseStorage, $mdDialog, $mdToast) {

  var THIS = this;
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
  var last = {
    bottom: true,
    top: false,
    left: false,
    right: true
  }
  var originatorEv;
  $scope.images = [];

  $scope.query = {
    order: 'name',
    limit: 5,
    page: 1
  };

  var ref = firebase.database().ref();
  $scope.events = $firebaseArray(ref.child('events'));

  $scope.toast = function(param) {
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
      .textContent(param)
      .position(pinTo)
      .hideDelay(3000)
    );
  }

  $scope.selectRow = function(param) {
    THIS.EVENT = param;
    $scope.showOption = true;
    $scope.images = THIS.EVENT.imageNames;
    $scope.images = $scope.images.concat(THIS.EVENT.coverName);
    console.log($scope.images);
    console.log(THIS.EVENT.eventStorageKey);
  };

  $scope.openMenu = function($mdMenu, ev, event) {
    console.log(`${event.title} -- menu`);
    originatorEv = ev;
    $mdMenu.open(ev);
  }

  $scope.add = function(ev) {
    $mdDialog.show({
      controller: "addEventDialogController",
      templateUrl: "views/dialog/event/eventDialog.template.html",
      parent: angular.element(document.body),
      targetEvent: ev,
      escapeToClose: false
    });
  };

  $scope.edit = function(ev) {
    $mdDialog.show({
      controller: "editEventDialogController",
      templateUrl: "views/dialog/event/eventDialog.template.html",
      parent: angular.element(document.body),
      targetEvent: ev,
      escapeToClose: false,
      locals: {
        EVENT: {
          event_id: THIS.EVENT.$id,
          title: THIS.EVENT.title,
          location: THIS.EVENT.location,
          description: THIS.EVENT.description,
          allDay: THIS.EVENT.allDay,
          eventStorageKey: THIS.EVENT.eventStorageKey,
          coverName: THIS.EVENT.coverName,
          coverURL: THIS.EVENT.coverURL,
          imageNames: THIS.EVENT.imageNames,
          imageURLS: THIS.EVENT.imageURLS,
          fromDate: THIS.EVENT.fromDate,
          toDate: THIS.EVENT.toDate,
          date: THIS.EVENT.date,
          fromTime: THIS.EVENT.fromTime,
          toTime: THIS.EVENT.toTime
        }
      }
    });
  }

  $scope.delete = function(ev) {
    // Appending dialog to document.body to cover sidenav in docs app
    var confirm = $mdDialog.confirm()
          .title(`Would you like to delete event: ${THIS.EVENT.title}?`)
          .textContent(`All data of event: ${THIS.EVENT.title} will be deleted`)
          .ariaLabel('Lucky day')
          .targetEvent(ev)
          .ok('Delete')
          .cancel('Cancel');

    $mdDialog.show(confirm).then(function() {
      $scope.events.$remove(THIS.EVENT);
      $scope.selected = [];
      $scope.showOption = true;

      for(var i=0; i < $scope.images.length; i++) {
        var storageRef = firebase.storage().ref(`/Photos/events/${THIS.EVENT.eventStorageKey}/${$scope.images[i]}`);
        $scope.storage = $firebaseStorage(storageRef);
        $scope.storage.$delete().then(function() {
          console.log("successfully deleted! ");
        });
      }

      $scope.toast(`${THIS.EVENT.title} event successfully deleted.`);
    }, function() {
      $mdDialog.hide();
    });
  };
});
