angular.
module("municipalityDetail").
component("municipalityDetail", {
  templateUrl: "views/municipalityDetail/municipalityDetail.template.html"
}).
controller("municipalityDetailController", function($scope, $rootScope, $firebaseArray, $firebaseStorage, $mdDialog, $mdToast, $routeParams) {
  $scope.municipalityId = $routeParams.municipalityId;

  console.log("municipality detail - " + $scope.municipalityId);
  $scope.categories = ['Show All', 'Landmark', 'Accommodation', 'Food', 'Recreation'];
  var THIS = this;
  $scope.description = "";
  $scope.imageURLS = [];
  $scope.imageNames = [];
  $scope.starred = false;
  $scope.isReady = false;
  $scope.selected = [];
  $scope.options = {
    rowSelection: true,
    multiSelect: false,
    autoSelect: true,
    decapitate: false,
    largeEditDialog: false,
    boundaryLinks: false,
    limitSelect: false,
    pageSelect: true
  };
  $scope.query = {
    order: 'name',
    limit: 5,
    page: 1
  };
  var last = {
    bottom: true,
    top: false,
    left: false,
    right: true
  }
  $scope.images = [];
  $scope.selectedIndex = $rootScope.selectedIndex;
  $scope.demo = {
    showTooltip: false,
    tipDirection: 'bottom'
  };
  $scope.toast = function(param) {
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
      .textContent(param)
      .position(pinTo)
      .hideDelay(3000)
    );
  }

  var ref = firebase.database().ref("municipality/" + $scope.municipalityId);
  $scope.municipality_items = $firebaseArray(ref);

  var ref = firebase.database().ref(`about`);
  $scope.aboutRef = $firebaseArray(ref);

  var database = firebase.database().ref(`about/${$scope.municipalityId}`);

  $scope.aboutRef.$loaded().then(function(item) {
    var itemData = $scope.aboutRef.$getRecord($scope.municipalityId);
    if (itemData != null) {
      $scope.description = itemData.description;
      $scope.imageURLS = itemData.imageURLS;
      $scope.imageNames = itemData.imageNames;
    } else {
      database.set({
        description: $scope.description,
        imageURLS: $scope.imageURLS,
        imageNames: $scope.imageNames
      });
    }

    if ($scope.imageURLS == undefined) {
      $scope.imageURLS = [];
    }

    if ($scope.imageNames == undefined) {
      $scope.imageNames = [];
    }

    $scope.isReady = true;
  });

  $scope.selectCatergory = function() {
    console.log(`${$scope.selectedCategories}`);
    if ($scope.selectedCategories == 'Show All') {
      console.log(`show all..`);
      $scope.selectedCategories = '';
    }

  }

  $scope.selectRow = function(param){
    THIS.MUNICIPALITY_ITEM = param;
    console.log(`${THIS.MUNICIPALITY_ITEM.municipalityStorageKey}`);
  }

  $scope.add = function(ev) {
    $mdDialog.show({
      controller: "addMunicipalityDetailDialogController",
      templateUrl: "views/dialog/municipality/municipalityDetailDialog.template.html",
      parent: angular.element(document.body),
      targetEvent: ev,
      escapeToClose: false,
      fullscreen: true,
      locals: {
        tab: $scope.tab,
        municipality: $scope.municipalityId
      }
    });
  };

  $scope.edit = function(ev) {
    $mdDialog.show({
      controller: "editMunicipalityDetailDialogController",
      templateUrl:  "views/dialog/municipality/municipalityDetailDialog.template.html",
      parent: angular.element(document.body),
      targetEvent: ev,
      escapeToClose: false,
      locals: {
        municipality: $scope.municipalityId,
        municipality_item: THIS.MUNICIPALITY_ITEM
      }
    });
  }

  $scope.delete = function(ev) {
    // Appending dialog to document.body to cover sidenav in docs app
    var confirm = $mdDialog.confirm()
    .title(`Would you like to delete event: ${THIS.MUNICIPALITY_ITEM.title}?`)
    .textContent(`All data of event: ${THIS.MUNICIPALITY_ITEM.title} will be deleted`)
    .ariaLabel('Lucky day')
    .targetEvent(ev)
    .ok('Delete')
    .cancel('Cancel');

    $mdDialog.show(confirm).then(function() {
      $scope.municipality_items.$remove(THIS.MUNICIPALITY_ITEM);
      $scope.selected = [];
      $scope.showOption = true;

      var storageCoverRef = firebase.storage().ref(`/Photos/${$scope.municipalityId}/${THIS.MUNICIPALITY_ITEM.municipalityStorageKey}/cover/${THIS.MUNICIPALITY_ITEM.coverName}`);
      $scope.storageCover = $firebaseStorage(storageCoverRef);
      $scope.storageCover.$delete().then(function() {
        console.log(`successfully deleted! cover`);
      });

      for(var i=0; i < THIS.MUNICIPALITY_ITEM.imageNames.length; i++) {
        var storageSampleRef = firebase.storage().ref(`/Photos/${$scope.municipalityId}/${THIS.MUNICIPALITY_ITEM.municipalityStorageKey}/${THIS.MUNICIPALITY_ITEM.imageNames[i]}`);
        $scope.storageSample = $firebaseStorage(storageSampleRef);
        $scope.storageSample.$delete().then(function() {
          console.log(`successfully deleted! sample`);
        });
      }

      $scope.toast(`${THIS.MUNICIPALITY_ITEM.title} event successfully deleted.`);
    }, function() {
      $mdDialog.hide();
    });
  }

  $scope.settings = function(ev) {
    $mdDialog.show({
      controller: "settingsMunicipalityItemController",
      templateUrl: "views/dialog/settings/settingsMunicipalityItemDialog.template.html",
      parent: angular.element(document.body),
      targetEvent: ev,
      escapeToClose: false
    });
  };

  $scope.saveDescription = function() {
    database.set({
      description: $scope.description,
      imageURLS: $scope.imageURLS,
      imageNames: $scope.imageNames
    });
  }

  $scope.selectSample = function(files) {
    $scope.fileSamples = files;
    console.log(`uploading selected photos`);
    console.log(`${$scope.fileSamples.length + $scope.imageNames.length}`);
    var expectedTotal = $scope.fileSamples.length + $scope.imageNames.length;

    for (var i = 0; i < $scope.fileSamples.length; i++) {
      var storageRef = firebase.storage().ref(`/Photos/${$scope.municipalityId}/sample/${$scope.fileSamples[i].name}`);
      $scope.storage = $firebaseStorage(storageRef);
      var uploadTaskSample = $scope.storage.$put($scope.fileSamples[i]);

      uploadTaskSample.$complete(function(snapshot) {
        var imageUrl = snapshot.downloadURL;
        var imageName = snapshot.metadata.name;

        $scope.imageURLS.push(imageUrl);
        $scope.imageNames.push(imageName);
        if (expectedTotal == $scope.imageNames.length) {
          database.set({
            description: $scope.description,
            imageURLS: $scope.imageURLS,
            imageNames: $scope.imageNames
          });
        }
      });
    }
  }

  $scope.deleteSample = function(index) {
    console.log(`${index}`);

    var storageRef = firebase.storage().ref(`/Photos/${$scope.municipalityId}/sample/${$scope.imageNames[index]}`);
    $scope.storage = $firebaseStorage(storageRef);
    $scope.storage.$delete().then(function() {
      console.log("successfully deleted sample!");
      $scope.imageURLS.splice(index, 1);
      $scope.imageNames.splice(index, 1);

      database.set({
        description: $scope.description,
        imageURLS: $scope.imageURLS,
        imageNames: $scope.imageNames
      });
    });
  }

  $scope.clearSample = function() {
    $scope.fileSamples = null;
  }

  $scope.upload = function() {
    for (var i = 0; i < $scope.fileSamples.length; i++) {
      var storageRef = firebase.storage().ref(`/Photos/${$scope.municipalityId}/sample/${$scope.fileSamples[i].name}`);
      $scope.storage = $firebaseStorage(storageRef);
      var uploadTaskSample = $scope.storage.$put($scope.fileSamples[i]);

      uploadTaskSample.$complete(function(snapshot) {
        var imageUrl = snapshot.downloadURL;
        var imageName = snapshot.metadata.name;

        $scope.imageURLS.push(imageUrl);
        $scope.imageNames.push(imageName);

        if ($scope.fileSamples.length == $scope.imageURLS.length) {

          database.set({
            description: $scope.description,
            imageURLS: $scope.imageURLS,
            imageNames: $scope.imageNames
          }).then(function() {
            $scope.fileSamples = null;
            console.log($scope.fileSamples);
          });
        }
      });
    }
  }

});
