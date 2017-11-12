angular.
module("capstone-web").
controller("addEventDialogController", function($scope, $mdpTimePicker, $http, uploadService, $firebaseArray, $firebaseStorage, $mdDialog, $timeout) {
  var events = firebase.database().ref();
  $scope.events = $firebaseArray(events.child('events'));

  $scope.add = true;

  $scope.allDay = false;
  $scope.dialogTitle = "New Event";
  $scope.tag = {};
  $scope.imageURLS = [];
  $scope.imageNames = [];
  $scope.displayMsg = true;
  $scope.msg = "No File selected. Please select a file to upload.";

  // Model bound to input fields and modal
  $scope.time = {
    from: new Date(),
    to: new Date()
  };

  $scope.readonly = false;

  $scope.required = true;

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

  $scope.closeDialog = function() {
    $mdDialog.hide();
  };

  $scope.selectSample = function(file) {
    $scope.fileList = file;
    console.log($scope.fileList);
  }

  $scope.selectCover = function(file) {
    $scope.fileCover = file;
  }

  $scope.uploadFile = function() {
    console.clear();
    console.log(`uploading...`);
    var completed = true;
    $scope.eventStorageKey = "event_" + Math.random().toString(36).substr(2, 5);
    console.log($scope.eventStorageKey);

    try {
      for (var i = 0; i < $scope.fileList.length; i++) {
        var storageRef = firebase.storage().ref(`/Photos/events/${$scope.eventStorageKey}/${$scope.fileList[i].name}`);
        $scope.storage = $firebaseStorage(storageRef);
        var uploadTaskSample = $scope.storage.$put($scope.fileList[i]);

        var storageRef = firebase.storage().ref(`/Photos/events/${$scope.eventStorageKey}/${$scope.fileCover.name}`);
        $scope.storage = $firebaseStorage(storageRef);
        var uploadTaskCover = $scope.storage.$put($scope.fileCover);
        uploadTaskCover.$complete(function(snapshot) {
          $scope.coverURL = snapshot.downloadURL;
          $scope.coverName = snapshot.metadata.name;
        })

        uploadTaskSample.$complete(function(snapshot) {
          var imageUrl = snapshot.downloadURL;
          var imageName = snapshot.metadata.name;
          var md5hash = snapshot.metadata.md5Hash;

          $scope.imageURLS.push(imageUrl);
          $scope.imageNames.push(imageName);

          if (completed == true && $scope.imageURLS.length == $scope.fileList.length) {
            console.log("CALL ONCE");
            console.log($scope.imageNames);

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
              console.log(`added record with id: ${id}`);
              $mdDialog.hide();
            });
            completed = false;
          }
        });
      }
    } catch (e) {
        console.log(e.message);
    }

  }

}).
controller("editEventDialogController", function($scope, $mdpTimePicker, $http, uploadService, $firebaseArray, $firebaseStorage, $mdDialog, $timeout, EVENT) {
  console.clear();
  console.log("edit");
  console.log(`${EVENT.imageNames}`);

  $scope.edit = true;

  var fromTime = EVENT.fromTime.split(":");
  var toTime = EVENT.toTime.split(":");
  console.log(`${fromTime[0]} : ${fromTime[1]}`);
  console.log(`${toTime[0]} : ${toTime[1]}`);

  $scope.time = {
    from: new Date(),
    to: new Date()
  };

  $scope.title = EVENT.title;
  $scope.location = EVENT.location;
  $scope.description = EVENT.description;
  $scope.allDay = EVENT.allDay;
  $scope.eventStorageKey = EVENT.eventStorageKey;
  $scope.coverName = EVENT.coverName;
  $scope.coverURL = EVENT.coverURL;
  $scope.imageNames = EVENT.imageNames;
  $scope.imageURLS = EVENT.imageURLS;
  $scope.time.from.setHours(fromTime[0]);
  $scope.time.from.setMinutes(fromTime[1]);
  $scope.time.to.setHours(toTime[0]);
  $scope.time.to.setMinutes(toTime[1]);
  if ($scope.allDay) {
    $scope.date = new Date(EVENT.date);
  } else {
    $scope.fromDate = new Date(EVENT.fromDate);
    $scope.toDate = new Date(EVENT.toDate);
  }


  $scope.closeDialog = function() {
    $mdDialog.hide();
  };
});
