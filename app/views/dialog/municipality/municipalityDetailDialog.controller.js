angular.
module("capstone-web").
controller("municipalityDetailDialogController", function($scope, $firebaseStorage, $firebaseArray, $mdDialog, municipality) {
  console.clear();
  console.log(municipality);

  var ref = firebase.database().ref("municipality");
  $scope.municipalities = $firebaseArray(ref.child(municipality));

  $scope.add = true;
  $scope.tag = {};
  $scope.imageURLS = [];
  $scope.imageNames = [];
  $scope.displayMsg = true;
  $scope.msg = "No File selected. Please select a file to upload.";
  $scope.categories = ['Landmark', 'Accommodation', 'Food', 'Recreation'];
  $scope.selectedCategories = [];

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
    console.log(`${$scope.municipalityStorageKey}`);

    try {
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
                coverName: $scope.coverName
              }).then(function(municipalities) {
                var id = municipalities.key;
                console.log(`added record with id: ${id}`);
                $mdDialog.hide();
              });
              completed = false;
            }
          });
        }
      });
    } catch (e) {
      console.log(e.message);
    }
  }

  $scope.closeDialog = function() {
    $mdDialog.hide();
  };

});
