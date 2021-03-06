angular.
module("eventContent").
component("eventContent", {
  templateUrl: "views/event/event.template.html"
}).
controller("eventController", function($scope, $rootScope, $firebaseArray, $firebaseStorage, $mdDialog, $mdToast) {

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
  $scope.starred = false;
  $scope.query = {
    order: 'name',
    limit: 10,
    page: 1
  };
  $rootScope.isReady = true;

  var ref = firebase.database().ref();
  $scope.events = $firebaseArray(ref.child('events'));

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

  $scope.selectRow = function(param) {
    THIS.EVENT = param;
    console.log(THIS.EVENT.$id);
  };

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

  $scope.delete = function(ev, event) {
    // Appending dialog to document.body to cover sidenav in docs app
    var confirm = $mdDialog.confirm()
          .title(`Would you like to delete event: ${event.title}?`)
          .textContent(`All data of event: ${event.title} will be deleted`)
          .ariaLabel('Lucky day')
          .targetEvent(ev)
          .ok('Delete')
          .cancel('Cancel');

    $mdDialog.show(confirm).then(function() {
      $scope.events.$remove(event);
      $scope.selected = [];
      $scope.showOption = true;

      var storageCoverRef = firebase.storage().ref(`/Photos/events/${event.eventStorageKey}/cover/${event.coverName}`);
      $scope.storageCover = $firebaseStorage(storageCoverRef);
      $scope.storageCover.$delete().then(function() {
        console.log(`successfully deleted! cover`);
      });

      for(var i=0; i < event.imageNames.length; i++) {
        var storageSampleRef = firebase.storage().ref(`/Photos/events/${event.eventStorageKey}/${event.imageNames[i]}`);
        $scope.storageSample = $firebaseStorage(storageSampleRef);
        $scope.storageSample.$delete().then(function() {
          console.log(`successfully deleted! sample`);
        });
      }

      $scope.toast(`Event: ${event.title} successfully deleted.`);
    }, function() {
      $mdDialog.hide();
    });
  };

});
