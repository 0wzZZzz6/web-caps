angular.
module("capstone-web").
controller("municipalityDetailDialogController", function($scope, $firebaseStorage, $firebaseArray, $mdDialog, municipality) {
  console.clear();
  console.log(municipality);

  var ref = firebase.database().ref("municipality");
  $scope.municipalities = $firebaseArray(ref.child(municipality));

  $scope.tag = {};
  $scope.URLS = [];
  $scope.imageNames = [];
  $scope.displayMsg = true;
  $scope.msg = "No File selected. Please select a file to upload.";
  $scope.categories = ['Landmark', 'Accommodation', 'Food', 'Recreation'];
  $scope.selectedCategories = [];

  $scope.printSelectedToppings = function() {
    var numberOfToppings = this.selectedCategories.length;

    // If there is more than one topping, we add an 'and'
    // to be gramatically correct. If there are 3+ toppings
    // we also add an oxford comma.
    if (numberOfToppings > 1) {
      var needsOxfordComma = numberOfToppings > 1;
      var lastToppingConjunction = (needsOxfordComma ? ', ' : '');
      var lastTopping = lastToppingConjunction +
      this.selectedCategories[this.selectedCategories.length - 1];
      return this.selectedCategories.slice(0, -1).join(', ') + lastTopping;
    }

    return this.selectedCategories.join('');
  }

  $scope.selectFile = function(file) {
    $scope.fileList = file;
    console.log($scope.fileList);
    $scope.displayMsg = false;
  }

  $scope.uploadFile = function() {
    var completed = true;
    // upload
    for (var i = 0; i < $scope.fileList.length; i++) {
      var storageRef = firebase.storage().ref('/Photos/' + municipality + "/" + $scope.fileList[i].name);
      $scope.storage = $firebaseStorage(storageRef);
      var uploadTask = $scope.storage.$put($scope.fileList[i]);
      uploadTask.$complete(function(snapshot) {
        var imageUrl = snapshot.downloadURL;
        var imageName = snapshot.metadata.name;

        $scope.URLS.push(imageUrl);
        $scope.imageNames.push(imageName);

        if (completed == true && $scope.URLS.length == $scope.fileList.length) {
          console.log("CALL ONCE");
          $scope.municipalities.$add({
            title: $scope.title,
            location: $scope.location,
            category: $scope.selectedCategories,
            contact: $scope.contact,
            imageURLS: $scope.URLS,
            imageNames: $scope.imageNames
          }).then(function(municipalities) {
            var id = municipalities.key;
            console.log(`added record with id: ${id}`);
            $mdDialog.hide();
          });
          completed = false;
        }

      });
    }
  }

  $scope.add = function(){
    $scope.municipalities.$add({
      title: $scope.title,
      location: $scope.location,
      category: $scope.selectedCategories,
      contact: $scope.contact,
      imageURLS: $scope.URLS
    }).then(function(municipalities) {
      var id = municipalities.key;
      console.log(`added record with id: ${id}`);
      $mdDialog.hide();
    });
  }

  $scope.closeDialog = function() {
    $mdDialog.hide();
  };

});
