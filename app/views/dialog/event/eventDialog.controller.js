angular.
module("capstone-web").
controller("addEventDialogController", function($scope, $mdpTimePicker, $http, uploadService, $firebaseArray, $firebaseStorage, $mdDialog, $timeout) {
  var events = firebase.database().ref();
  $scope.events = $firebaseArray(events.child('events'));

  $scope.add = true;
  $scope.allDay = false;
  $scope.readonly = false;
  $scope.required = true;
  $scope.dialogTitle = "New Event";
  $scope.tag = {};
  $scope.imageURLS = [];
  $scope.imageNames = [];
  $scope.starred = false;
  // Model bound to input fields and modal
  $scope.time = {
    from: new Date(),
    to: new Date()
  };

  $scope.selectCover = function(file) {
    $scope.fileCover = file;
  }

  $scope.selectSample = function(file) {
    $scope.fileSample = file;
  }

  $scope.uploadFile = function() {
    console.clear();
    var completed = true;

    if ($scope.fileCover === undefined || $scope.fileCover == null) {
      $scope.fileCover = false;
    }

    if ($scope.fileSample === undefined || $scope.fileSample == null || !$scope.fileSample.length) {
      $scope.fileSample = false;
    }

    console.log(`form - ${$scope.eventForm.$valid}`);
    console.log(`fileCover - ${$scope.fileCover}`);
    console.log(`fileSample - ${$scope.fileSample}`);

    try {
      if ($scope.fileCover && $scope.fileSample && $scope.eventForm.$valid) {
        console.log(`[UPLOADING]`);
        $scope.eventStorageKey = "event_" + Math.random().toString(36).substr(2, 5);

        var storageRef = firebase.storage().ref(`/Photos/events/${$scope.eventStorageKey}/cover/${$scope.fileCover.name}`);
        $scope.storage = $firebaseStorage(storageRef);
        var uploadTaskCover = $scope.storage.$put($scope.fileCover);
        uploadTaskCover.$complete(function(snapshot) {
          $scope.coverURL = snapshot.downloadURL;
          $scope.coverName = snapshot.metadata.name;
          console.log(`[COMPLETE] cover`);

          for (var i = 0; i < $scope.fileSample.length; i++) {
            var storageRef = firebase.storage().ref(`/Photos/events/${$scope.eventStorageKey}/${$scope.fileSample[i].name}`);
            $scope.storage = $firebaseStorage(storageRef);
            var uploadTaskSample = $scope.storage.$put($scope.fileSample[i]);

            uploadTaskSample.$complete(function(snapshot) {
              var imageUrl = snapshot.downloadURL;
              var imageName = snapshot.metadata.name;

              $scope.imageURLS.push(imageUrl);
              $scope.imageNames.push(imageName);

              console.log(`[COMPLETE] sample`);

              if (completed == true && $scope.imageURLS.length == $scope.fileSample.length) {
                console.log("[UPLOADING] data");

                if($scope.allDay){
                  $scope.sfromDate = null;
                  $scope.stoDate = null;
                  $scope.sdate = $scope.date.getTime();
                } else {
                  $scope.sfromDate = $scope.fromDate.getTime();
                  $scope.stoDate = $scope.toDate.getTime();
                  $scope.sdate = null;
                }

                $scope.events.$add({
                  title: $scope.title,
                  location: $scope.location,
                  allDay: $scope.allDay,
                  date: $scope.sdate,
                  fromDate: $scope.sfromDate,
                  toDate: $scope.stoDate,
                  description: $scope.description,
                  fromTime:  $scope.time.from.getHours() + ":" + $scope.time.from.getMinutes(),
                  toTime: $scope.time.to.getHours() + ":" + $scope.time.to.getMinutes(),
                  imageURLS: $scope.imageURLS,
                  imageNames: $scope.imageNames,
                  coverURL: $scope.coverURL,
                  coverName: $scope.coverName,
                  eventStorageKey: $scope.eventStorageKey,
                  starred: $scope.starred
                }).then(function(events) {
                  var id = events.key;
                  console.log(`[ADDED] record with id: ${id}`);
                });
                completed = false;
              }
            });
          }
        });

        $mdDialog.hide();
      } else {
        console.log(`[ERROR] provide cover and sample picture. fill up input fields`);
      }
    } catch (e) {
      console.log(e.message);
    }

  }

  $scope.closeDialog = function() {
    $mdDialog.hide();
  };

  $scope.star = function() {
    if ($scope.starred) {
      $scope.starred = false;
    } else {
      $scope.starred = true;
    }
  };
}).
controller("editEventDialogController", function($scope, $mdpTimePicker, $http, uploadService, $firebaseArray, $firebaseStorage, $mdDialog, $timeout, EVENT) {
  $scope.edit = true;
  $scope.time = {
    from: new Date(),
    to: new Date()
  };
  // $scope.fromDate = new Date();
  // $scope.toDate = new Date();
  // $scope.date = new Date();
  $scope.imageURLS = [];
  $scope.imageNames = [];
  $scope.starred = false;

  $scope.delImageURLS = [];
  $scope.delImageNames = [];
  $scope.delCoverURL = null;
  $scope.delCoverName = null;

  $scope.old = new Object();
  $scope.current = new Object();

  console.clear();
  console.log("edit");

  var ref = firebase.database().ref();
  $scope.eventDatabase = $firebaseArray(ref.child(`events`));

  $scope.eventDatabase.$loaded().then(function (event) {
    var eventData = $scope.eventDatabase.$getRecord(EVENT.event_id);

    var fromTime = eventData.fromTime.split(":");
    var toTime = eventData.toTime.split(":");

    $scope.title = eventData.title;
    $scope.location = eventData.location;
    $scope.description = eventData.description;
    $scope.allDay = eventData.allDay;
    $scope.eventStorageKey = eventData.eventStorageKey;
    $scope.coverName = eventData.coverName;
    $scope.coverURL = eventData.coverURL;
    $scope.imageNames = eventData.imageNames;
    $scope.imageURLS = eventData.imageURLS;
    $scope.time.from.setHours(fromTime[0]);
    $scope.time.from.setMinutes(fromTime[1]);
    $scope.time.to.setHours(toTime[0]);
    $scope.time.to.setMinutes(toTime[1]);
    $scope.starred = eventData.starred;
    if ($scope.allDay) {
      $scope.date = new Date(eventData.date);
    } else {
      $scope.fromDate = new Date(eventData.fromDate);
      $scope.toDate = new Date(eventData.toDate);
    }


    $scope.old.title = eventData.title;
    $scope.old.location = eventData.location;
    $scope.old.description = eventData.description;
    $scope.old.allDay = eventData.allDay;
    $scope.old.eventStorageKey = eventData.eventStorageKey;
    $scope.old.coverName = eventData.coverName;
    $scope.old.coverURL = eventData.coverURL;
    $scope.old.imageNames = eventData.imageNames;
    $scope.old.imageURLS = eventData.imageURLS;
    $scope.old.fromTime = eventData.fromTime;
    $scope.old.toTime = eventData.toTime;
    $scope.old.starred = eventData.starred;
    if (eventData.allDay) {
      $scope.old.date = eventData.date;
    } else {
      $scope.old.fromDate = eventData.fromDate;
      $scope.old.toDate = eventData.toDate;
    }



  });

  $scope.selectCover = function(file) {
    $scope.fileCover = file;
    var storageRef = firebase.storage().ref(`/Photos/events/${$scope.eventStorageKey}/cover/${$scope.fileCover.name}`);
    $scope.storage = $firebaseStorage(storageRef);
    var uploadTaskCover = $scope.storage.$put($scope.fileCover);
    uploadTaskCover.$complete(function(snapshot) {
      $scope.coverURL = snapshot.downloadURL;
      $scope.coverName = snapshot.metadata.name;
      console.log(`[COMPLETE] cover`);
    });
    $scope.fileCover = null;
  }

  $scope.selectSample = function(file) {
    $scope.fileSample = file;
    for (var i = 0; i < $scope.fileSample.length; i++) {
      var storageRef = firebase.storage().ref(`/Photos/events/${$scope.eventStorageKey}/${$scope.fileSample[i].name}`);
      $scope.storage = $firebaseStorage(storageRef);
      var uploadTaskSample = $scope.storage.$put($scope.fileSample[i]);
      uploadTaskSample.$complete(function(snapshot) {
        var imageUrl = snapshot.downloadURL;
        var imageName = snapshot.metadata.name;
        if (!$scope.imageURLS && !$scope.imageNames) {
          console.log(`zero samples`);
          $scope.imageURLS = [];
          $scope.imageNames = [];
        }
        $scope.imageURLS.push(imageUrl);
        $scope.imageNames.push(imageName);
        console.log(`[COMPLETE] sample`);
      });
    }
    $scope.fileSample = null;
  }

  $scope.deleteCover = function(imgName) {
    $scope.delCoverName = imgName;
    $scope.coverURL = null;
    $scope.coverName = null;
  }

  $scope.deleteSample = function(index) {
    $scope.delImageURLS.push($scope.imageURLS[index]);
    $scope.delImageNames.push($scope.imageNames[index]);

    $scope.imageURLS.splice(index, 1);
    $scope.imageNames.splice(index, 1);
  }

  $scope.isEquivalent = function (a, b) {
    // Create arrays of property names
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);

    // If number of properties is different,
    // objects are not equivalent
    if (aProps.length != bProps.length) {
      return false;
    }

    for (var i = 0; i < aProps.length; i++) {
      var propName = aProps[i];

      // If values of same property are not equal,
      // objects are not equivalent
      if (a[propName] !== b[propName]) {
        return false;
      }
    }

    // If we made it this far, objects
    // are considered equivalent
    return true;
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
        $scope.current.title = $scope.title;
        $scope.current.location = $scope.location;
        $scope.current.description = $scope.description;
        $scope.current.allDay = $scope.allDay;
        $scope.current.eventStorageKey = $scope.eventStorageKey;
        $scope.current.coverName = $scope.coverName;
        $scope.current.coverURL = $scope.coverURL;
        $scope.current.imageNames = $scope.imageNames;
        $scope.current.imageURLS = $scope.imageURLS;
        $scope.current.fromTime = $scope.time.from.getHours() + ":" + $scope.time.from.getMinutes();
        $scope.current.toTime = $scope.time.to.getHours() + ":" + $scope.time.to.getMinutes();
        $scope.current.starred = $scope.starred;
        if ($scope.allDay) {
          $scope.current.date = $scope.date.getTime();
        } else {
          $scope.current.fromDate = $scope.fromDate.getTime();
          $scope.current.toDate = $scope.toDate.getTime();
        }
        console.log($scope.isEquivalent($scope.current, $scope.old));

        console.log("[UPLOADING] data");
        var record = $scope.eventDatabase.$getRecord(EVENT.event_id);
        record.title = $scope.title;
        record.location = $scope.location;
        record.description = $scope.description;
        record.allDay = $scope.allDay;
        record.eventStorageKey = $scope.eventStorageKey;
        record.coverName = $scope.coverName;
        record.coverURL = $scope.coverURL;
        record.imageNames = $scope.imageNames;
        record.imageURLS = $scope.imageURLS;
        record.fromTime = $scope.time.from.getHours() + ":" + $scope.time.from.getMinutes();
        record.toTime = $scope.time.to.getHours() + ":" + $scope.time.to.getMinutes();
        record.starred = $scope.starred;
        if ($scope.allDay) {
          record.fromDate = null;
          record.toDate = null;
          record.date = $scope.date.getTime();
        } else {
          record.fromDate = $scope.fromDate.getTime();
          record.toDate = $scope.toDate.getTime();
          record.date = null;
        }

        $scope.eventDatabase.$save(record).then(function() {
          if ($scope.delCoverName) {
            var storageRefCover = firebase.storage().ref(`/Photos/events/${$scope.eventStorageKey}/cover/${$scope.delCoverName}`);
            $scope.storageCover = $firebaseStorage(storageRefCover);
            $scope.storageCover.$delete().then(function() {
              console.log("successfully deleted cover!");
            });
          }

          if ($scope.delImageNames) {
            for (var i = 0; i < $scope.delImageNames.length; i++) {
              var storageRefSamples = firebase.storage().ref(`/Photos/events/${$scope.eventStorageKey}/${$scope.delImageNames[i]}`);
              $scope.storageSamples = $firebaseStorage(storageRefSamples);
              $scope.storageSamples.$delete().then(function() {
                console.log("successfully deleted sample!");
              });
            }
          }

          console.log(`successfully updated`);
          $mdDialog.hide();
        });

      } else {
        console.log(`invalid form...`);
      }
    } catch (e) {
      console.log(e.message);
    }
  }

  $scope.closeDialog = function() {
    $mdDialog.hide();
  };

  $scope.star = function() {
    if ($scope.starred) {
      $scope.starred = false;
    } else {
      $scope.starred = true;
    }
  };

});
