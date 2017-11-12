'use strict';

angular.
module('capstone-web').
service("uploadService", function($http, $q) {

  return ({
    upload: upload
  });

  function upload(file) {
    var upl = $http({
      method: 'POST',
      url: 'http://jsonplaceholder.typicode.com/posts', // /api/upload
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      data: {
        upload: file
      },
      transformRequest: function(data, headersGetter) {
        var formData = new FormData();
        angular.forEach(data, function(value, key) {
          formData.append(key, value);
        });

        var headers = headersGetter();
        delete headers['Content-Type'];

        return formData;
      }
    });
    return upl.then(handleSuccess, handleError);

  } // End upload function
  
  function handleError(response, data) {
    if (!angular.isObject(response.data) ||!response.data.message) {
      return ($q.reject("An unknown error occurred."));
    }

    return ($q.reject(response.data.message));
  }

  function handleSuccess(response) {
    return (response);
  }

}).
config(['$locationProvider', '$routeProvider', '$mdDateLocaleProvider', '$mdThemingProvider',
function config($locationProvider, $routeProvider, $mdDateLocaleProvider, $mdThemingProvider){
  // $mdDateLocaleProvider.formatDate = function(date) {
  //   return moment(date).format('MMM, DD, YYYY');
  // };

  $mdThemingProvider.theme('default')
  .primaryPalette('green')
  .accentPalette('blue-grey');

  $locationProvider.hashPrefix('');

  $routeProvider.
  when('/municipality', {
    template: '<municipality-content></municipality-content>'
  }).
  when('/municipality/:municipalityId', {
    template: '<municipality-detail></municipality-detail>'
  }).
  when('/events', {
    template: '<event-content></event-content>'
  });
}
]);
