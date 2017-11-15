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
  // $scope.fromDate = new Date();
  // $scope.toDate = new Date();
  // $scope.date = new Date();
  // Model bound to input fields and modal
  $scope.time = {
    from: new Date(),
    to: new Date()
  };

  // $scope.$watch('file', function(newfile, oldfile) {
  //   if(angular.equals(newfile, oldfile) ){
  //     return;
  //   }
  //
  //   uploadService.upload(newfile).then(function(res){
  //     // DO SOMETHING WITH THE RESULT!
  //     console.log("result", res);
  //   })
  // });

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

    console.log(`from - ${$scope.eventForm.$valid}`);
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
                  eventStorageKey: $scope.eventStorageKey
                }).then(function(events) {
                  var id = events.key;
                  console.log(`[ADDED] record with id: ${id}`);
                  $mdDialog.hide();
                });
                completed = false;
              }
            });
          }
        });
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
    if ($scope.allDay) {
      $scope.date = new Date(eventData.date);
    } else {
      $scope.fromDate = new Date(eventData.fromDate);
      $scope.toDate = new Date(eventData.toDate);
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
      $scope.save();
    });
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
        $scope.imageURLS.push(imageUrl);
        $scope.imageNames.push(imageName);
        console.log(`[COMPLETE] sample`);
        $scope.save();
      });
    }
    $scope.fileSample = null;
  }

  $scope.deleteCover = function(imgName) {
    console.log(`${imgName}`);
    var storageRef = firebase.storage().ref(`/Photos/events/${$scope.eventStorageKey}/cover/${imgName}`);
    $scope.storage = $firebaseStorage(storageRef);
    $scope.storage.$delete().then(function() {
      console.log("successfully deleted cover!");
    });
    $scope.coverURL = null;
    $scope.coverName = null;
    $scope.save();
  }

  $scope.deleteSample = function(index) {
    console.log(`${$scope.imageNames[index]}`);
    var storageRef = firebase.storage().ref(`/Photos/events/${$scope.eventStorageKey}/${$scope.imageNames[index]}`);
    $scope.storage = $firebaseStorage(storageRef);
    $scope.storage.$delete().then(function() {
      console.log("successfully deleted sample!");
    });
    $scope.imageURLS.splice(index, 1);
    $scope.imageNames.splice(index, 1);
    $scope.save();
  }

  $scope.save = function() {
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
    if ($scope.allDay) {
      record.fromDate = null;
      record.toDate = null;
      record.date = $scope.date.getTime();
    } else {
      record.fromDate = $scope.fromDate.getTime();
      record.toDate = $scope.toDate.getTime();
      record.date = null;
    }

    $scope.eventDatabase.$save(record);
  }

  $scope.uploadFile = function() {
    console.clear();
    $scope.save();
    $mdDialog.hide();
  }

  $scope.closeDialog = function() {
    $mdDialog.hide();
  };

});
