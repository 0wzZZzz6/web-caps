angular.
module("capstone-web").
controller("addMunicipalityDetailDialogController", function($scope, $firebaseStorage, $firebaseArray, $mdDialog, $mdToast, municipality) {
  console.clear();
  console.log(municipality);

  var ref = firebase.database().ref("municipality");
  $scope.municipalities = $firebaseArray(ref.child(municipality));

  $scope.add = true;
  $scope.tag = {};
  $scope.imageURLS = [];
  $scope.imageNames = [];
  $scope.categories = ['Landmark', 'Accommodation', 'Food', 'Recreation'];
  $scope.selectedCategories = [];
  $scope.starred = false;

  // $scope.printSelectedToppings = function() {
  //   var numberOfToppings = this.selectedCategories.length;
  //
  //   // If there is more than one topping, we add an 'and'
  //   // to be gramatically correct. If there are 3+ toppings
  //   // we also add an oxford comma.
  //   if (numberOfToppings > 1) {
  //     var needsOxfordComma = numberOfToppings > 1;
  //     var lastToppingConjunction = (needsOxfordComma ? ', ' : '');
  //     var lastTopping = lastToppingConjunction +
  //     this.selectedCategories[this.selectedCategories.length - 1];
  //     return this.selectedCategories.slice(0, -1).join(', ') + lastTopping;
  //   }
  //
  //   return this.selectedCategories.join('');
  // }

  $scope.selectCover = function(file) {
    $scope.fileCover = file;
  }

  $scope.selectSample = function(file) {
    $scope.fileList = file;
  }

  $scope.uploadFile = function() {
    console.clear();
    console.log(`uploading...`);
    var completed = true;
    $scope.municipalityStorageKey = `${municipality}_` + Math.random().toString(36).substr(2, 5);
    console.log($scope.municipalityItemForm.$valid);
    console.log($scope.fileCover);
    console.log($scope.fileList);

    try {
      if ($scope.municipalityItemForm.$valid && $scope.fileCover && $scope.fileList ) {
        var storageRef = firebase.storage().ref(`/Photos/${municipality}/${$scope.municipalityStorageKey}/cover/${$scope.fileCover.name}`);
        $scope.storage = $firebaseStorage(storageRef);
        var uploadTaskCover = $scope.storage.$put($scope.fileCover);
        uploadTaskCover.$complete(function(snapshot) {
          $scope.coverURL = snapshot.downloadURL;
          $scope.coverName = snapshot.metadata.name;
          console.log(`cover upload completed`);

          for (var i = 0; i < $scope.fileList.length; i++) {
            var storageRef = firebase.storage().ref(`/Photos/${municipality}/${$scope.municipalityStorageKey}/${$scope.fileList[i].name}`);
            $scope.storage = $firebaseStorage(storageRef);
            var uploadTaskSample = $scope.storage.$put($scope.fileList[i]);

            uploadTaskSample.$complete(function(snapshot) {
              var imageUrl = snapshot.downloadURL;
              var imageName = snapshot.metadata.name;

              $scope.imageURLS.push(imageUrl);
              $scope.imageNames.push(imageName);

              if (completed == true && $scope.imageURLS.length == $scope.fileList.length) {
                console.log("CALL ONCE");
                $scope.municipalities.$add({
                  title: $scope.title,
                  location: $scope.location,
                  category: $scope.selectedCategories,
                  contact: $scope.contact,
                  municipalityStorageKey: $scope.municipalityStorageKey,
                  imageURLS: $scope.imageURLS,
                  imageNames: $scope.imageNames,
                  coverURL: $scope.coverURL,
                  coverName: $scope.coverName,
                  starred: $scope.starred
                }).then(function(municipalities) {
                  var id = municipalities.key;
                  console.log(`added record with id: ${id}`);
                  $scope.toast(`Municipality item successfully added.`);
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

}).
controller("editMunicipalityDetailDialogController", function($scope, $firebaseStorage, $firebaseArray, $mdDialog, $mdToast, municipality, municipality_item) {
  console.clear();
  console.log(`${municipality}/${municipality_item.$id}`);

  $scope.edit = true;
  $scope.tag = {};
  $scope.imageURLS = [];
  $scope.imageNames = [];
  $scope.categories = ['Landmark', 'Accommodation', 'Food', 'Recreation'];
  $scope.selectedCategories = [];
  $scope.starred = false;

  $scope.delImageURLS = [];
  $scope.delImageNames = [];
  $scope.delCoverURL = null;
  $scope.delCoverName = null;

  var ref = firebase.database().ref();
  $scope.municipalityDatabase = $firebaseArray(ref.child(`municipality/${municipality}`));

  $scope.municipalityDatabase.$loaded().then(function(item) {
    var itemData = $scope.municipalityDatabase.$getRecord(`${municipality_item.$id}`);

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
  });

  $scope.selectCover = function(file) {
    $scope.fileCover = file;
    var storageRef = firebase.storage().ref(`/Photos/${municipality}/${$scope.municipalityStorageKey}/cover/${$scope.fileCover.name}`);
    $scope.storage = $firebaseStorage(storageRef);
    var uploadTaskCover = $scope.storage.$put($scope.fileCover);
    uploadTaskCover.$complete(function(snapshot) {
      $scope.coverURL = snapshot.downloadURL;
      $scope.coverName = snapshot.metadata.name;
      console.log(`[COMPLETE] cover`);
      // $scope.save();
    });
    $scope.fileCover = null;
  }

  $scope.selectSample = function(file) {
    $scope.fileSample = file;
    for (var i = 0; i < $scope.fileSample.length; i++) {
      var storageRef = firebase.storage().ref(`/Photos/${municipality}/${$scope.municipalityStorageKey}/${$scope.fileSample[i].name}`);
      $scope.storage = $firebaseStorage(storageRef);
      var uploadTaskSample = $scope.storage.$put($scope.fileSample[i]);
      uploadTaskSample.$complete(function(snapshot) {
        var imageUrl = snapshot.downloadURL;
        var imageName = snapshot.metadata.name;

        $scope.imageURLS.push(imageUrl);
        $scope.imageNames.push(imageName);
        console.log(`[COMPLETE] sample`);
        // $scope.save();
      });
    }
    $scope.fileSample = null;
  }

  $scope.deleteCover = function(imgName) {
    // var storageRef = firebase.storage().ref(`/Photos/${municipality}/${$scope.municipalityStorageKey}/cover/${imgName}`);
    // $scope.storage = $firebaseStorage(storageRef);
    // $scope.storage.$delete().then(function() {
    //   console.log("successfully deleted cover!");
    // });
    $scope.delCoverName = imgName;
    $scope.coverURL = null;
    $scope.coverName = null;
    // $scope.save();
  }

  $scope.deleteSample = function(index) {
    // var storageRef = firebase.storage().ref(`/Photos/${municipality}/${$scope.municipalityStorageKey}/${$scope.imageNames[index]}`);
    // $scope.storage = $firebaseStorage(storageRef);
    // $scope.storage.$delete().then(function() {
    //   console.log("successfully deleted sample!");
    // });

    $scope.delImageURLS.push($scope.imageURLS[index]);
    $scope.delImageNames.push($scope.imageNames[index]);

    $scope.imageURLS.splice(index, 1);
    $scope.imageNames.splice(index, 1);
    // $scope.save();
  }

  $scope.save = function() {
    if ($scope.coverURL === undefined || $scope.coverURL == null) {
      console.log(`invalid no cover`);
      $scope.coverURL = false;
    }

    if ($scope.imageURLS === undefined || $scope.imageURLS == null || !$scope.imageURLS.length) {
      console.log(`invalid no samples`);
      $scope.imageURLS = false;
    }

    try {
      if ($scope.municipalityItemForm.$valid && $scope.coverURL && $scope.imageURLS ) {
        console.log("[UPLOADING] data");
        var record = $scope.municipalityDatabase.$getRecord(`${municipality_item.$id}`);
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

        $scope.municipalityDatabase.$save(record).then(function () {
          if ($scope.delCoverName) {
          var storageRefCover = firebase.storage().ref(`/Photos/${municipality}/${$scope.municipalityStorageKey}/cover/${$scope.delCoverName}`);
          $scope.storageCover = $firebaseStorage(storageRefCover);
          $scope.storageCover.$delete().then(function() {
            console.log("successfully deleted cover!");
          });
          }

          if ($scope.delImageNames) {
          for (var i = 0; i < $scope.delImageNames.length; i++) {
            var storageRefSamples = firebase.storage().ref(`/Photos/${municipality}/${$scope.municipalityStorageKey}/${$scope.delImageNames[i]}`);
            $scope.storageSamples = $firebaseStorage(storageRefSamples);
            $scope.storageSamples.$delete().then(function() {
              console.log("successfully deleted sample!");
            });
          }
          }

          console.log(`successfully updated`);
          $scope.toast(`Item successfully updated.`);
          $mdDialog.hide();
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

  $scope.uploadFile = function() {
    $scope.save();
  }

  $scope.closeDialog = function() {
    $mdDialog.hide();
  };

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
