angular.
module("eventDialog").
component("eventDialog", {
  templateUrl: "views/event/dialog/eventDialog.template.html"
}).
controller("eventDialogController", function($scope, $rootScope, $routeParams, $http, $firebaseStorage, $firebaseArray, $element, $mdToast) {

  $scope.old = new Object();
  $scope.current = new Object();
  $scope.showProgress = true;
  $scope.allDay = false;
  $scope.readonly = false;
  $scope.required = true;

  $scope.fileSamples = [];
  $scope.imageURLS = [];
  $scope.imageNames = [];
  $scope.starred = false;

  $scope.delImageURLS = [];
  $scope.delImageNames = [];
  $scope.delCoverURL = false;
  $scope.delCoverName = false;

  $scope.mode = $routeParams.mode;
  $scope.itemId = $routeParams.itemId;

  $scope.time = {
    from: new Date(),
    to: new Date()
  };

  $scope.taggedMunicipality = [];

  $scope.municipalities = [
    'Baungon', 'Cabanglasan', 'Damulog',
    'Dangcagan', 'Don Carlos', 'Impasugong',
    'Kadingilan', 'Kalilangan', 'Kibawe',
    'Kitaotao', 'Lantapan', 'Libona',
    'Malaybalay', 'Maramag', 'Malitbog',
    'Manolo Fortich', 'Pangantucan', 'Quezon',
    'San Fernando', 'Sumilao', 'Talakag', 'Valencia'
  ]
  $scope.searchTerm;

  var ref = firebase.database().ref(`events`);
  $scope.eventDatabase = $firebaseArray(ref);
  $scope.eventDatabase.$loaded().then(function (event) {
    var event = $scope.eventDatabase.$getRecord($scope.itemId);

    try {
      if (event != null) {
        var fromTime = event.fromTime.split(":");
        var toTime = event.toTime.split(":");

        $scope.title = event.title;
        $scope.location = event.location;
        $scope.description = event.description;
        $scope.allDay = event.allDay;
        $scope.eventStorageKey = event.eventStorageKey;
        $scope.coverName = event.coverName;
        $scope.coverURL = event.coverURL;
        $scope.imageNames = event.imageNames;
        $scope.imageURLS = event.imageURLS;
        $scope.time.from.setHours(fromTime[0]);
        $scope.time.from.setMinutes(fromTime[1]);
        $scope.time.to.setHours(toTime[0]);
        $scope.time.to.setMinutes(toTime[1]);
        $scope.starred = event.starred;
        $scope.taggedMunicipality = event.taggedMunicipality;
        if ($scope.allDay) {
          $scope.startDate = new Date(event.startDate);
        } else {
          $scope.startDate = new Date(event.startDate);
          $scope.endDate = new Date(event.endDate);
        }

        $scope.showProgress = false;
      }
    } catch (e) {
      console.log(e);
    } finally {

    }

  });


  if ($scope.mode == "add"){
    $scope.add = true;
    $scope.showProgress = false;
    $scope.dialogTitle = "New Event";

    $scope.selectCover = function(file) {
      $scope.fileCover = file;
    }

    $scope.selectSample = function(files) {
      for(var i = 0; i < files.length; i++) {
        $scope.fileSamples.push(files[i]);
      }
    }

    $scope.deleteSample = function(index) {
      $scope.fileSamples.splice(index, 1);
    }

    $scope.uploadFile = function() {
      console.clear();
      var completed = true;

      if ($scope.fileCover === undefined || $scope.fileCover == null) {
        $scope.fileCover = false;
      }

      if ($scope.fileSamples === undefined || $scope.fileSamples == null || !$scope.fileSamples.length) {
        $scope.fileSamples = false;
      }

      console.log(`form - ${$scope.eventForm.$valid}`);
      console.log(`fileCover - ${$scope.fileCover}`);
      console.log(`fileSample - ${$scope.fileSamples}`);

      try {
        if ($scope.fileCover && $scope.fileSamples && $scope.eventForm.$valid) {
          console.log(`[UPLOADING]`);
          $scope.eventStorageKey = "event_" + Math.random().toString(36).substr(2, 5);

          var storageRef = firebase.storage().ref(`/Photos/events/${$scope.eventStorageKey}/cover/${$scope.fileCover.name}`);
          $scope.storage = $firebaseStorage(storageRef);
          var uploadTaskCover = $scope.storage.$put($scope.fileCover);
          uploadTaskCover.$complete(function(snapshot) {
            $scope.coverURL = snapshot.downloadURL;
            $scope.coverName = snapshot.metadata.name;
            console.log(`[COMPLETE] cover`);

            for (var i = 0; i < $scope.fileSamples.length; i++) {
              var storageRef = firebase.storage().ref(`/Photos/events/${$scope.eventStorageKey}/${$scope.fileSamples[i].name}`);
              $scope.storage = $firebaseStorage(storageRef);
              var uploadTaskSample = $scope.storage.$put($scope.fileSamples[i]);

              uploadTaskSample.$complete(function(snapshot) {
                var imageUrl = snapshot.downloadURL;
                var imageName = snapshot.metadata.name;

                $scope.imageURLS.push(imageUrl);
                $scope.imageNames.push(imageName);

                console.log(`[COMPLETE] sample`);

                if (completed == true && $scope.imageURLS.length == $scope.fileSamples.length) {
                  console.log("[UPLOADING] data");

                  if($scope.allDay){
                    $scope.sDate = $scope.startDate.getTime();
                    $scope.eDate = null;
                  } else {
                    $scope.sDate = $scope.startDate.getTime();
                    $scope.eDate = $scope.endDate.getTime();
                  }

                  $scope.eventDatabase.$add({
                    title: $scope.title,
                    location: $scope.location,
                    allDay: $scope.allDay,
                    startDate: $scope.sDate,
                    endDate: $scope.eDate,
                    description: $scope.description,
                    fromTime:  $scope.time.from.getHours() + ":" + $scope.time.from.getMinutes(),
                    toTime: $scope.time.to.getHours() + ":" + $scope.time.to.getMinutes(),
                    imageURLS: $scope.imageURLS,
                    imageNames: $scope.imageNames,
                    coverURL: $scope.coverURL,
                    coverName: $scope.coverName,
                    eventStorageKey: $scope.eventStorageKey,
                    starred: $scope.starred,
                    taggedMunicipality: $scope.taggedMunicipality
                  }).then(function(events) {
                    window.history.back();
                    var id = events.key;
                    console.log(`[ADDED] record with id: ${id}`);
                    $scope.toast(`Event successfully added.`);
                  });
                  completed = false;
                }
              });
            }
          });
        } else {
          console.log(`[ERROR] provide cover and sample picture. fill up input fields`);
          $scope.toast(`Complete all fields.`);
        }
      } catch (e) {
        console.log(e.message);
      }

    }
  } else {
    $scope.edit = true;
    $scope.dialogTitle = "Edit Event";

    $scope.selectCover = function(file) {
      $scope.fileCover = file;
      var storageRef = firebase.storage().ref(`/Photos/events/${$scope.eventStorageKey}/cover/${$scope.fileCover.name}`);
      $scope.storage = $firebaseStorage(storageRef);
      var uploadTaskCover = $scope.storage.$put($scope.fileCover);
      uploadTaskCover.$complete(function(snapshot) {
        $scope.coverURL = snapshot.downloadURL;
        $scope.coverName = snapshot.metadata.name;
        $scope.update();
        console.log(`[COMPLETE] cover`);
        $scope.fileCover = null;
      });
    }

    $scope.selectSample = function(file) {
      $scope.fileSamples = file;

      for(var i = 0; i < $scope.fileSamples.length; i ++) {
        console.log(`${$scope.fileSamples[i].name}`);
      }
      // $scope.showProgress_uploading = true;
      // var expectedTotal = $scope.fileSample.length + $scope.imageURLS.length;
      // for (var i = 0; i < $scope.fileSample.length; i++) {
      //   var storageRef = firebase.storage().ref(`/Photos/events/${$scope.eventStorageKey}/${$scope.fileSample[i].name}`);
      //   $scope.storage = $firebaseStorage(storageRef);
      //   var uploadTaskSample = $scope.storage.$put($scope.fileSample[i]);
      //   uploadTaskSample.$complete(function(snapshot) {
      //     $scope.imageURLS.push(snapshot.downloadURL);
      //     $scope.imageNames.push(snapshot.metadata.name);
      //
      //     if (expectedTotal == $scope.imageNames.length) {
      //       console.log(`[COMPLETE] sample`);
      //       $scope.update();
      //       $scope.showProgress_uploading = false;
      //       $scope.fileSample = null;
      //     }
      //   });
      // }
    }

    $scope.deleteCover = function(imgName) {
      $scope.delCoverName = imgName;
      $scope.coverURL = "";
      $scope.coverName = "";
      var storageRefCover = firebase.storage().ref(`/Photos/events/${$scope.eventStorageKey}/cover/${$scope.delCoverName}`);
      $scope.storageCover = $firebaseStorage(storageRefCover);
      $scope.storageCover.$delete().then(function() {
        console.log(`deleted cover`);
        $scope.update();
        $scope.delCoverName = null;
      });
    }

    $scope.deleteSample = function(index) {
      $scope.delImageURLS = $scope.imageURLS[index];
      $scope.delImageNames = $scope.imageNames[index];

      $scope.imageURLS.splice(index, 1);
      $scope.imageNames.splice(index, 1);
      var storageRefSamples = firebase.storage().ref(`/Photos/events/${$scope.eventStorageKey}/${$scope.delImageNames}`);
      $scope.storageSamples = $firebaseStorage(storageRefSamples);
      $scope.storageSamples.$delete().then(function() {
        console.log(`deleted sample`);
        $scope.update();
        $scope.delImageURLS = null;
        $scope.delImageNames = null;
      });
    }

    $scope.uploadFile = function() {
      try {
        if ($scope.coverURL === undefined || $scope.coverURL == null) {
          console.log(`invalid no cover`);
          $scope.coverURL = false;
        }

        if ($scope.imageURLS === undefined || $scope.imageURLS == null || !$scope.imageURLS.length) {
          console.log(`invalid no samples`);
          $scope.imageURLS = false;
        }

        if ($scope.eventForm.$valid && $scope.coverURL && $scope.imageURLS ) {
          $scope.toast("Updating Event");
          $scope.showProgress = true;

          var record = $scope.eventDatabase.$getRecord($scope.itemId);
          record.title = $scope.title;
          record.location = $scope.location;
          record.description = $scope.description;
          record.allDay = $scope.allDay;
          record.eventStorageKey = $scope.eventStorageKey;
          record.fromTime = $scope.time.from.getHours() + ":" + $scope.time.from.getMinutes();
          record.toTime = $scope.time.to.getHours() + ":" + $scope.time.to.getMinutes();
          record.starred = $scope.starred;
          record.taggedMunicipality = $scope.taggedMunicipality;
          if ($scope.allDay) {
            record.startDate = $scope.startDate.getTime();
            record.endDate = null;
          } else {
            record.startDate = $scope.startDate.getTime();
            record.endDate = $scope.endDate.getTime();
          }

          $scope.eventDatabase.$save(record).then(function() {
            $scope.toast(`Event successfully updated.`);
            window.history.back();
          });
        } else {
          console.log(`invalid form...`);
          if (!$scope.imageURLS) {
            $scope.imageURLS = [];
          }
        }
      } catch (e) {
        console.log(e.message);
      }
    }

    $scope.update = function() {
      var record = $scope.eventDatabase.$getRecord($scope.itemId);
      record.coverName = $scope.coverName;
      record.coverURL = $scope.coverURL;
      record.imageNames = $scope.imageNames;
      record.imageURLS = $scope.imageURLS;

      $scope.eventDatabase.$save(record).then(function() {
        console.log(`cover/sample successfully updated`);
      });
    }
  }

  $scope.clearSearchTerm = function() {
    $scope.searchTerm = '';
  };

  $scope.closeDialog = function() {
    window.history.back();
  }

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

  $scope.star = function() {
    if ($scope.starred) {
      $scope.starred = false;
    } else {
      $scope.starred = true;
    }
  };

});
