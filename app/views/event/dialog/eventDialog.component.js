angular.
module("eventDialog").
component("eventDialog", {
  templateUrl: "views/event/dialog/eventDialog.template.html"
}).
controller("eventDialogController", function($scope, $rootScope, $routeParams, $http, $firebaseStorage, $firebaseArray, $element, $mdDialog, $mdToast) {

  $scope.old = new Object();
  $scope.current = new Object();
  $scope.showProgress = true;
  $scope.allDay = false;
  $scope.required = true;

  $scope.fileSamples = [];
  $scope.imageURLS = [];
  $scope.imageNames = [];
  $scope.starred = false;

  $scope.cover = null;
  $scope.photos = new Array();
  $scope.delImageURLS = new Array();
  $scope.delImageNames = new Array();
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
    $scope.dialogTitle = "New Event";

    $scope.showProgress = false;

    $scope.selectCover = function(cover) {
      $scope.cover = cover;
    }

    $scope.selectPhotos = function(photos) {
      var files = photos;
      for(var i = 0; i < files.length; i++) {
        console.log(`${files[i].name}`);
        $scope.photos.push(files[i]);
      }
    }

    $scope.removePhoto = function(index) {
      $scope.photos.splice(index, 1);
    }

    $scope.uploadFile = function() {
      console.clear();
      var completed = true;

      try {
        if ($scope.cover != null && $scope.photos.length != 0 && $scope.eventForm.$valid) {
          console.log(`[UPLOADING]`);
          $scope.eventStorageKey = "event_" + Math.random().toString(36).substr(2, 5);

          var storageRef = firebase.storage().ref(`/Photos/events/${$scope.eventStorageKey}/cover/${$scope.cover.name}`);
          $scope.storage = $firebaseStorage(storageRef);
          var uploadTaskCover = $scope.storage.$put($scope.cover);
          uploadTaskCover.$complete(function(snapshot) {
            $scope.coverURL = snapshot.downloadURL;
            $scope.coverName = snapshot.metadata.name;
            console.log(`[COMPLETE] cover`);

            for (var i = 0; i < $scope.photos.length; i++) {
              var storageRef = firebase.storage().ref(`/Photos/events/${$scope.eventStorageKey}/${$scope.photos[i].name}`);
              $scope.storage = $firebaseStorage(storageRef);
              var uploadTaskSample = $scope.storage.$put($scope.photos[i]);
              uploadTaskSample.$complete(function(snapshot) {
                var imageUrl = snapshot.downloadURL;
                var imageName = snapshot.metadata.name;

                $scope.imageURLS.push(imageUrl);
                $scope.imageNames.push(imageName);

                console.log(`[COMPLETE] sample`);

                if (completed == true && $scope.imageURLS.length == $scope.photos.length) {
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

    $scope.selectCover = function(cover) {
      $scope.cover = cover;
    }

    $scope.selectPhotos = function(files) {
      $scope.photos = files;
      // $scope.showProgress_uploading = true;
    }

    $scope.replaceCover = function(cover, file) {
      $scope.cover = cover;
      $scope.delCoverName = $scope.coverName;
      $scope.coverURL = null;
      $scope.coverName = null;
    }

    $scope.removeImageURL = function(index) {
      $scope.delImageURLS.push($scope.imageURLS[index]);
      $scope.delImageNames.push($scope.imageNames[index]);

      $scope.imageURLS.splice(index, 1);
      $scope.imageNames.splice(index, 1);
    }

    $scope.removePhoto = function(index) {
      $scope.photos.splice(index, 1);
    }

    $scope.uploadFile = function() {
      if (($scope.coverURL || $scope.cover) && ($scope.imageURLS.length != 0 || $scope.photos.length != 0) && $scope.eventForm.$valid) {
        console.clear();
        console.log(`valid`);
        $scope.toast(`Updating...`);
        $scope.showProgress = true;

        if ($scope.cover !== undefined && $scope.cover != null) {
          // delete old cover here...
          var storageRef = firebase.storage().ref(`/Photos/events/${$scope.eventStorageKey}/cover/${$scope.delCoverName}`);
          $scope.storage = $firebaseStorage(storageRef)
          $scope.storage.$delete().then(function() {
            console.log(`cover deleted`);
          });

          // upload new cover here...
          var storageRef = firebase.storage().ref(`/Photos/events/${$scope.eventStorageKey}/cover/${$scope.cover.name}`);
          $scope.storage = $firebaseStorage(storageRef);
          var uploadTask = $scope.storage.$put($scope.cover);
          uploadTask.$complete(function(snapshot) {
            console.log(`cover uploaded`);
            $scope.coverURL = snapshot.downloadURL;
            $scope.coverName = snapshot.metadata.name;
            // update here
            var record = $scope.eventDatabase.$getRecord($scope.itemId);
            record.coverName = $scope.coverName;
            record.coverURL = $scope.coverURL;

            $scope.eventDatabase.$save(record);
          });
        }

        if ($scope.delImageNames.length != 0) {
          // delete delImageNames in firebase here...
          for (var i = 0; i < $scope.delImageNames.length; i++) {
            var storageRef = firebase.storage().ref(`/Photos/events/${$scope.eventStorageKey}/${$scope.delImageNames[i]}`);
            $scope.storageSamples = $firebaseStorage(storageRef);
            $scope.storageSamples.$delete().then(function() {
              console.log(`deleted sample`);
              // update here
              var record = $scope.eventDatabase.$getRecord($scope.itemId);
              record.imageNames = $scope.imageNames;
              record.imageURLS = $scope.imageURLS;

              $scope.eventDatabase.$save(record);
            });
          }
        }

        if ($scope.photos.length != 0) {
          // upload new photos to firebase here..
          $rootScope.isReady = false;
          if ($scope.imageURLS.length == 0 && $scope.imageNames.length == 0) {
            $scope.imageURLS = new Array();
            $scope.imageNames = new Array();
          }
          var totalLength = $scope.photos.length + $scope.imageNames.length;
          for (var i = 0; i < $scope.photos.length; i++) {
            var storageRef = firebase.storage().ref(`/Photos/events/${$scope.eventStorageKey}/${$scope.photos[i].name}`);
            $scope.storage = $firebaseStorage(storageRef);
            var uploadTaskSample = $scope.storage.$put($scope.photos[i]);
            uploadTaskSample.$complete(function(snapshot) {
              console.log(`${i} - upload completed`);
              $scope.imageURLS.push(snapshot.downloadURL);
              $scope.imageNames.push(snapshot.metadata.name);

              if(totalLength == $scope.imageNames.length) {
                console.log($scope.imageURLS.length);
                var record = $scope.eventDatabase.$getRecord($scope.itemId);
                record.imageNames = $scope.imageNames;
                record.imageURLS = $scope.imageURLS;

                $scope.eventDatabase.$save(record);
                window.history.back();
                $scope.toast(`Update complete`);
              }
              // update here
            });
          }
        }

        if ($scope.eventForm.$valid) {
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

          record.coverName = $scope.coverName;
          record.coverURL = $scope.coverURL;
          record.imageNames = $scope.imageNames;
          record.imageURLS = $scope.imageURLS;

          $scope.eventDatabase.$save(record);
        }

        if ($scope.photos.length == 0) {
          window.history.back();
          $scope.toast(`Update complete`);
        }
      } else {
        console.log(`not valid`);
        $scope.toast(`Complete all fields.`);
      }
    }

  }

  $scope.clearSearchTerm = function() {
    $scope.searchTerm = '';
  };

  $scope.closeDialog = function(ev) {

    // Appending dialog to document.body to cover sidenav in docs app
    var confirm = $mdDialog.confirm()
    .title('Data will not be save.')
    .ariaLabel('Lucky day')
    .targetEvent(ev)
    .ok('Ok')
    .cancel('Cancel');

    $mdDialog.show(confirm).then(function() {
      window.history.back();
    }, function() {
      console.log(`dialog open`);
    });
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
