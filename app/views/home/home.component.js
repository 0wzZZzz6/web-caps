angular.
module("homeContent").
component("homeContent", {
  templateUrl: "views/home/home.template.html"
}).
controller("homeController", function($scope, $firebaseArray, $firebaseStorage, $mdDialog, $mdToast) {
  console.log(`home`);

  var news = firebase.database().ref();
  $scope.news = $firebaseArray(news.child('news'));

  $scope.addNews = function(ev) {
    $mdDialog.show({
      controller: "addNewsDialogController",
      templateUrl: "views/dialog/news/newsDialog.template.html",
      parent: angular.element(document.body),
      targetEvent: ev,
      escapeToClose: false
    });
  };

  $scope.edit = function(ev, item) {
    $mdDialog.show({
      controller: "editNewsDialogController",
      templateUrl:  "views/dialog/news/newsDialog.template.html",
      parent: angular.element(document.body),
      targetEvent: ev,
      escapeToClose: false,
      locals: {
        news_item: item
      }
    });
  };

  $scope.delete = function(ev, item) {
    // Appending dialog to document.body to cover sidenav in docs app
    var confirm = $mdDialog.confirm()
          .title(`Would you like to delete news: ${item.title}?`)
          .textContent(`All data of news: ${item.title} will be deleted`)
          .ariaLabel('Lucky day')
          .targetEvent(ev)
          .ok('Delete')
          .cancel('Cancel');

    $mdDialog.show(confirm).then(function() {
      $scope.news.$remove(item);

      var storageCoverRef = firebase.storage().ref(`/Photos/news/${item.newsStorageKey}/${item.coverName}`);
      $scope.storageCover = $firebaseStorage(storageCoverRef);
      $scope.storageCover.$delete().then(function() {
        console.log(`successfully deleted! cover`);
      });

      $scope.toast(`News: ${item.$id} successfully deleted.`);
    }, function() {
      console.log(`cancelled delete`);
    });
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

});
