angular.
module("mdetailDialog").
component("mdetailDialog", {
  templateUrl: "views/municipalityDetail/dialog/mdetailDialog.template.html"
}).
controller("mdetailDialogController", function($scope, $rootScope, $routeParams, $http, $firebaseStorage, $firebaseArray, $element, $mdToast) {
  $scope.municipalityId = $routeParams.municipalityId;
  $scope.mode = $routeParams.mode;
  $scope.itemId = $routeParams.itemId;

  var ref = firebase.database().ref();
  $scope.municipalityDatabase = $firebaseArray(ref.child(`municipality/${$scope.municipalityId}`));


  $scope.fileSamples = [];
  $scope.imageURLS = [];
  $scope.imageNames = [];
  $scope.categories = ['Landmark', 'Accommodation', 'Food', 'Recreation'];
  $scope.selectedCategories = [];
  $scope.starred = false;

  $scope.delImageURLS = [];
  $scope.delImageNames = [];
  $scope.delCoverURL = null;
  $scope.delCoverName = null;

  if ($scope.mode == "add") {
    $scope.add = true;
    $scope.dialogTitle = "Add";

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

      console.log(`form - ${$scope.municipalityItemForm.$valid}`);
      console.log(`fileCover - ${$scope.fileCover}`);
      console.log(`fileSample - ${$scope.fileSamples}`);

      try {
        if ($scope.fileCover && $scope.fileSamples && $scope.municipalityItemForm.$valid) {
          console.log(`[UPLOADING]`);
          $scope.municipalityStorageKey = `${$scope.municipalityId}_` + Math.random().toString(36).substr(2, 5);

          var storageRef = firebase.storage().ref(`/Photos/${$scope.municipalityId}/${$scope.municipalityStorageKey}/cover/${$scope.fileCover.name}`);
          $scope.storage = $firebaseStorage(storageRef);
          var uploadTaskCover = $scope.storage.$put($scope.fileCover);
          uploadTaskCover.$complete(function(snapshot) {
            $scope.coverURL = snapshot.downloadURL;
            $scope.coverName = snapshot.metadata.name;
            console.log(`[COMPLETE] cover`);

            for (var i = 0; i < $scope.fileSamples.length; i++) {
              var storageRef = firebase.storage().ref(`/Photos/${$scope.municipalityId}/${$scope.eventStorageKey}/${$scope.fileSamples[i].name}`);
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

                  $scope.municipalityDatabase.$add({
                    title: $scope.title,
                    location: $scope.location,
                    category: $scope.selectedCategories,
                    contact: $scope.contact,
                    municipalityStorageKey: $scope.municipalityStorageKey,
                    imageURLS: $scope.imageURLS,
                    imageNames: $scope.imageNames,
                    coverURL: $scope.coverURL,
                    coverName: $scope.coverName,
                    starred: $scope.starred,
                    latlon: $scope.latlon,
                    description: $scope.description,
                    stars: new Object()
                  }).then(function(item) {
                    $scope.closeDialog();
                    var id = item.key;
                    console.log(`[ADDED] record with id: ${id}`);
                    $scope.toast(`Item successfully added.`);
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

  } else {
    $scope.edit = true;
    $scope.dialogTitle = "Edit";

    $scope.municipalityDatabase.$loaded().then(function(itemData) {
      if (itemData != null) {
        var itemData = $scope.municipalityDatabase.$getRecord(`${$scope.itemId}`);

        $scope.title = itemData.title;
        $scope.selectedCategories = itemData.category;
        $scope.location = itemData.location;
        $scope.contact = itemData.contact;
        $scope.municipalityStorageKey = itemData.municipalityStorageKey;
        $scope.coverName = itemData.coverName;
        $scope.coverURL = itemData.coverURL;
        $scope.imageNames = itemData.imageNames;
        $scope.imageURLS = itemData.imageURLS;
        $scope.starred = itemData.starred;
        $scope.latlon = itemData.latlon;
        $scope.description = itemData.description;
      } else {
        console.log(`${$scope.municipalityId}/${$scope.itemId}`);
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
      $scope.showProgress_uploading = true;
      var expectedTotal = $scope.fileSample.length + $scope.imageURLS.length;
      for (var i = 0; i < $scope.fileSample.length; i++) {
        var storageRef = firebase.storage().ref(`/Photos/events/${$scope.eventStorageKey}/${$scope.fileSample[i].name}`);
        $scope.storage = $firebaseStorage(storageRef);
        var uploadTaskSample = $scope.storage.$put($scope.fileSample[i]);
        uploadTaskSample.$complete(function(snapshot) {
          var imageUrl = snapshot.downloadURL;
          var imageName = snapshot.metadata.name;
          $scope.imageURLS.push(imageUrl);
          $scope.imageNames.push(imageName);

          if (expectedTotal == $scope.imageNames.length) {
            console.log(`[COMPLETE] sample`);
            $scope.update();
            $scope.showProgress_uploading = false;
          }

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
      $scope.update();
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

        if ($scope.municipalityItemForm.$valid && $scope.coverURL && $scope.imageURLS ) {
          $scope.toast("Updating Item");
          $scope.showProgress = true;
          $scope.update();
          $scope.toast(`Item successfully updated.`);
          $scope.closeDialog();
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
      var record = $scope.municipalityDatabase.$getRecord(`${$scope.itemId}`);
      record.title = $scope.title;
      record.category = $scope.selectedCategories;
      record.location = $scope.location;
      record.contact = $scope.contact;
      record.municipalityStorageKey = $scope.municipalityStorageKey;
      record.coverName = $scope.coverName;
      record.coverURL = $scope.coverURL;
      record.imageNames = $scope.imageNames;
      record.imageURLS = $scope.imageURLS;
      record.starred = $scope.starred;
      record.latlon = $scope.latlon;
      record.description = $scope.description;

      $scope.municipalityDatabase.$save(record).then(function () {
        if ($scope.delCoverName) {
          var storageRefCover = firebase.storage().ref(`/Photos/${$scope.municipalityId}/${$scope.municipalityStorageKey}/cover/${$scope.delCoverName}`);
          $scope.storageCover = $firebaseStorage(storageRefCover);
          $scope.storageCover.$delete().then(function() {
            console.log("successfully deleted cover!");
          });
        }

        if ($scope.delImageNames) {
          for (var i = 0; i < $scope.delImageNames.length; i++) {
            var storageRefSamples = firebase.storage().ref(`/Photos/${$scope.municipalityId}/${$scope.municipalityStorageKey}/${$scope.delImageNames[i]}`);
            $scope.storageSamples = $firebaseStorage(storageRefSamples);
            $scope.storageSamples.$delete().then(function() {
              console.log(`${i} successfully deleted sample!`);
            });
          }
        }
      });
    }

  }

  $scope.closeDialog = function() {
    $rootScope.selectedIndex = 1;
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
