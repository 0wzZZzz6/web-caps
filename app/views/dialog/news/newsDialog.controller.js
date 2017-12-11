angular.
module("capstone-web").
controller("addNewsDialogController", function($scope, $firebaseArray, $firebaseStorage, $mdToast, $mdDialog, $timeout) {
  console.log(`news dialog add controller`);

  var news = firebase.database().ref();
  $scope.news = $firebaseArray(news.child('news'));

  $scope.add = true;

  $scope.selectCover = function(file) {
    $scope.fileCover = file;
  }

  $scope.uploadFile = function() {
    console.clear();
    var completed = true;

    if ($scope.fileCover === undefined || $scope.fileCover == null) {
      $scope.fileCover = false;
    }

    console.log(`form - ${$scope.newsForm.$valid}`);
    console.log(`fileCover - ${$scope.fileCover}`);

    try {
      if ($scope.fileCover && $scope.newsForm.$valid) {
        console.log(`[UPLOADING]`);
        $scope.newsStorageKey = "event_" + Math.random().toString(36).substr(2, 5);

        var storageRef = firebase.storage().ref(`/Photos/news/${$scope.newsStorageKey}/${$scope.fileCover.name}`);
        $scope.storage = $firebaseStorage(storageRef);
        var uploadTaskCover = $scope.storage.$put($scope.fileCover);
        uploadTaskCover.$complete(function(snapshot) {
          $scope.coverURL = snapshot.downloadURL;
          $scope.coverName = snapshot.metadata.name;
          console.log(`[COMPLETE] cover`);

          $scope.news.$add({
            title: $scope.title,
            link: $scope.link,
            coverURL: $scope.coverURL,
            coverName: $scope.coverName,
            newsStorageKey: $scope.newsStorageKey,
            timestamp: new Date().getTime()
          }).then(function(news) {
            var id = news.key;
            console.log(`[ADDED] record with id: ${id}`);
            $scope.toast(`[ADDED] record with id: ${id}`);
          });
        });

        $mdDialog.hide();
      } else {
        console.log(`[ERROR] provide cover and sample picture. fill up input fields`);
      }
    } catch (e) {
      console.log(e.message);
    }

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

  $scope.closeDialog = function() {
    $mdDialog.hide();
  };
}).
controller("editNewsDialogController", function($scope, $firebaseArray, $firebaseStorage, $mdToast, $mdDialog, $timeout, news_item) {
  console.log(`news dialog edit controller`);

  var news = firebase.database().ref();
  $scope.news = $firebaseArray(news.child('news'));

  $scope.edit = true;
  $scope.delCoverName = null;

  $scope.news.$loaded().then(function(item) {
    var itemData = $scope.news.$getRecord(`${news_item.$id}`);

    $scope.title = itemData.title;
    $scope.link = itemData.link;
    $scope.newsStorageKey = itemData.newsStorageKey;
    $scope.coverName = itemData.coverName;
    $scope.coverURL = itemData.coverURL;
  });

  $scope.selectCover = function(file) {
    $scope.fileCover = file;

    var storageRef = firebase.storage().ref(`/Photos/news/${$scope.newsStorageKey}/${$scope.fileCover.name}`);
    $scope.storage = $firebaseStorage(storageRef);
    var uploadTaskCover = $scope.storage.$put($scope.fileCover);
    uploadTaskCover.$complete(function(snapshot) {
      $scope.coverURL = snapshot.downloadURL;
      $scope.coverName = snapshot.metadata.name;
      console.log(`[COMPLETE] cover`);
    });
  };

  $scope.deleteCover = function(imgName) {
    $scope.delCoverName = imgName;
    $scope.coverURL = null;
    $scope.coverName = null;
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
  };

  $scope.uploadFile = function() {
    if ($scope.coverURL === undefined || $scope.coverURL == null) {
      console.log(`invalid no cover`);
      $scope.coverURL = false;
    }

    try {
      if ($scope.newsForm.$valid && $scope.coverURL) {
        console.log("[UPLOADING] data");
        var record = $scope.news.$getRecord(`${news_item.$id}`);

        record.title = $scope.title;
        record.link = $scope.link;
        record.newsStorageKey = $scope.newsStorageKey;
        record.coverName = $scope.coverName;
        record.coverURL = $scope.coverURL;
        record.timestamp = new Date().getTime();

        $scope.news.$save(record).then(function () {
          if ($scope.delCoverName) {
            var storageRefCover = firebase.storage().ref(`/Photos/news/${$scope.newsStorageKey}/${$scope.delCoverName}`);
            $scope.storageCover = $firebaseStorage(storageRefCover);
            $scope.storageCover.$delete().then(function() {
              console.log("successfully deleted cover!");
            });
          }

          console.log(`successfully updated`);
          $scope.toast(`Item successfully updated.`);
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
});
