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
        var storageRef = firebase.storage().ref(`/Photos/events/${$scope.eventStorageKey}/${$scope.fileCover.name}`);
        $scope.storage = $firebaseStorage(storageRef);
        var uploadTaskCover = $scope.storage.$put($scope.fileCover);
        uploadTaskCover.$complete(function(snapshot) {
          $scope.coverURL = snapshot.downloadURL;
          $scope.coverName = snapshot.metadata.name;
          console.log(`cover upload completed`);
        });

        var storageRef = firebase.storage().ref(`/Photos/events/${$scope.eventStorageKey}/${$scope.fileList[i].name}`);
        $scope.storage = $firebaseStorage(storageRef);
        var uploadTaskSample = $scope.storage.$put($scope.fileList[i]);

        uploadTaskSample.$complete(function(snapshot) {
          var imageUrl = snapshot.downloadURL;
          var imageName = snapshot.metadata.name;
          // var md5hash = snapshot.metadata.md5Hash;

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
  $scope.edit = true;
  $scope.time = {
    from: new Date(),
    to: new Date()
  };

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
    console.log(`${$scope.fileCover}`);
    var storageRef = firebase.storage().ref(`/Photos/events/${$scope.eventStorageKey}/${$scope.fileCover.name}`);
    $scope.storage = $firebaseStorage(storageRef);
    var uploadTaskCover = $scope.storage.$put($scope.fileCover);
    uploadTaskCover.$complete(function(snapshot) {
      $scope.coverURL = snapshot.downloadURL;
      $scope.coverName = snapshot.metadata.name;
      console.log(`cover upload completed`);
      $scope.save();
    });
  }

  $scope.selectSample = function(file) {
    $scope.fileList = file;
    for (var i = 0; i < $scope.fileList.length; i++) {
      var storageRef = firebase.storage().ref(`/Photos/events/${$scope.eventStorageKey}/${$scope.fileList[i].name}`);
      $scope.storage = $firebaseStorage(storageRef);
      var uploadTaskSample = $scope.storage.$put($scope.fileList[i]);
      uploadTaskSample.$complete(function(snapshot) {
        var imageUrl = snapshot.downloadURL;
        var imageName = snapshot.metadata.name;

        $scope.imageURLS.push(imageUrl);
        $scope.imageNames.push(imageName);

        $scope.save();

      });
    }
    $scope.fileList = null;
  }

  $scope.save = function() {
    console.log(`uploading...`);
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
    $scope.save();
    $mdDialog.hide();
  }

  $scope.deleteCover = function(imgName) {
    console.log(`${imgName}`);
    var storageRef = firebase.storage().ref(`/Photos/events/${$scope.eventStorageKey}/${imgName}`);
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

  $scope.closeDialog = function() {
    $mdDialog.hide();
  };

});
