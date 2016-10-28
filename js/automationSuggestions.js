angular.module('Nudgeit', ['ngResource', 'ngRoute'
        , 'ngMockE2E', 'ui.bootstrap'
    ]
)

    .factory("AutomationSuggestion", ["$resource", function ($resource) {
        return $resource(
            'js/automationSuggestions.json/:ID',
            {ID: '@ID'},
            {
                'update': {
                    method: 'POST',
                    interceptor: {
                        responseError: handleError
                    }
                },
                'save': {
                    method: 'PUT',
                    interceptor: {
                        responseError: handleError
                    }
                },
                'get': {
                    cache: false,
                    method: 'GET',
                    interceptor: {
                        responseError: handleError
                    }
                },
                'query': {
                    isArray: true,
                    cache: false,
                    method: 'GET',
                    interceptor: {
                        responseError: handleError
                    }
                },
                'remove': {
                    method: 'DELETE',
                    interceptor: {
                        responseError: handleError
                    }
                }
            }
        );
    }])

    .controller('AutomationSuggestionCtrl', function ($scope, $uibModal, AutomationSuggestion) {

        $scope.suggestions = AutomationSuggestion.query();

        $scope.makeSuggestion = function () {
            var modalInstance = $uibModal.open({
                //scope: $scope,
                templateUrl: "details.html",
                controller: 'SuggestionDialogCtrl',
                size: 'md',
                backdrop: 'static',
                resolve: {
                    suggestion: function () {
                        return new AutomationSuggestion();
                    }
                }
            });

            modalInstance.result.then(function (suggestion) {
                console.log(suggestion);
                if (suggestion)
                    AutomationSuggestion.save(
                        null,
                        suggestion,
                        function () {
                            suggestion.ID = Math.round((Math.random() * 10000));
                            $scope.suggestions.push(suggestion);
                        }
                    );

            }, function () {
            });
        };

        $scope.approve = function (suggestion) {
            //suggestion.$update();

            var clone = angular.copy(suggestion);
            clone.status = 'Approved';
            //clone.update
            AutomationSuggestion.update(
                null,
                clone,
                function () {
                    angular.extend(suggestion, clone);
                }
            );
        };

        $scope.remove = function (suggestion) {
            if (confirm('Are you sure you want to remove it?')) {
                AutomationSuggestion.remove(
                    null,
                    suggestion,
                    function () {
                        var index = $.inArray(suggestion, $scope.suggestions);
                        $scope.suggestions.splice(index, 1);
                    }
                );
            }
        };

        $scope.done = function (suggestion) {
            //suggestion.$update();

            var clone = angular.copy(suggestion);
            clone.status = 'Done';
            AutomationSuggestion.update(
                null,
                clone,
                function () {
                    angular.extend(suggestion, clone);
                }
            );
        };

    })
    .controller('SuggestionDialogCtrl', function ($scope, $uibModalInstance, suggestion) {
        $scope.suggestion = suggestion;
        $scope.users = USERS;

        $scope.save = function () {
            $uibModalInstance.close($scope.suggestion);
        };

        $scope.close = function () {
            $uibModalInstance.close();
        };


    })
    .run(function ($httpBackend, $templateCache) {

        $httpBackend.when('POST', new RegExp("js\/automationSuggestions.json\/\d*"))
            .respond(function (method, url, data, headers, params) {
                return [200, 'OK'];
            });
        $httpBackend.when('PUT', "js/automationSuggestions.json")
            .respond(function (method, url, data, headers, params) {
                return [200, 'OK'];
            });
        $httpBackend.when('DELETE', new RegExp("js\/automationSuggestions.json\/\d*"))
            .respond(function (method, url, data, headers, params) {
                return [200, 'OK'];
            });
        $httpBackend.when('GET', 'js/automationSuggestions.json').passThrough();
        $httpBackend.when('GET', 'details.html').passThrough();

        $templateCache.put("details.html",
            "<div class=\"modal-content\">\n"+
            "\n"+
            "    <div class=\"modal-header\">\n"+
            "        <button type=\"button\" class=\"close\" aria-label=\"Close\" ng-click=\"close()\">\n"+
            "            <span aria-hidden=\"true\">&times;</span>\n"+
            "        </button>\n"+
            "\n"+
            "        <h4 class=\"modal-title\">SUGGEST NEW AUTOMATION</h4>\n"+
            "    </div>\n"+
            "\n"+
            "    <div class=\"modal-body\" ng-form=\"suggestForm\">\n"+
            "        <div class=\"row\">\n"+
            "            <div class=\"col-md-5\">\n"+
            "                <label for=\"title\" class=\"control-label align-left ng-binding form-field-required\">DESCRIPTION OF PROCESS</label>\n"+
            "            </div>\n"+
            "            <div class=\"col-md-7\">\n"+
            "                <textarea ng-model=\"suggestion.Title\" name=\"title\" id=\"title\" required=\"true\"></textarea>\n"+
            "            </div>\n"+
            "        </div>\n"+
            "\n"+
            "        <div class=\"row\">\n"+
            "            <div class=\"col-md-5\">\n"+
            "                <label for=\"SuggestedBy\" class=\"control-label align-left ng-binding form-field-required\">Owner</label>\n"+
            "            </div>\n"+
            "            <div class=\"col-md-7\">\n"+
            "                <input type=\"text\"\n"+
            "                       uib-typeahead=\"user as user.first for user in users | filter:{first:$viewValue}\"\n"+
            "                       ng-model=\"suggestion.SuggestedBy\" name=\"SuggestedBy\" id=\"SuggestedBy\" required=\"true\"></input>\n"+
            "            </div>\n"+
            "        </div>\n"+
            "\n"+
            "        <div class=\"row\">\n"+
            "            <div class=\"col-md-5\">\n"+
            "                <label for=\"TimeSavedPerWeek\" class=\"control-label align-left ng-binding form-field-required\">TimeSavedPerWeek</label>\n"+
            "            </div>\n"+
            "            <div class=\"col-md-7\">\n"+
            "                <input type=\"time\" max=\"{{'12:00' | date:'HH:mm'}}\"\n"+
            "                       ng-model=\"suggestion.TimeSavedPerWeek\" name=\"TimeSavedPerWeek\" id=\"TimeSavedPerWeek\" required=\"true\"></input>\n"+
            "            </div>\n"+
            "        </div>\n"+
            "\n"+
            "        <div class=\"row\">\n"+
            "            <div class=\"col-md-5\">\n"+
            "                <label for=\"NumberOfTicketsPerWeek\" class=\"control-label align-left ng-binding form-field-required\">NumberOfTicketsPerWeek</label>\n"+
            "            </div>\n"+
            "            <div class=\"col-md-7\">\n"+
            "                <input type=\"number\" ng-model=\"suggestion.NumberOfTicketsPerWeek\" name=\"NumberOfTicketsPerWeek\" id=\"NumberOfTicketsPerWeek\" required=\"true\"></input>\n"+
            "            </div>\n"+
            "        </div>\n"+
            "    </div>\n"+
            "    <div class=\"modal-footer\">\n"+
            "        <button type=\"button\" class=\"btn\" ng-click=\"close()\">CANCEL</button>\n"+
            "        <button type=\"button\" class=\"btn\" ng-click=\"save()\" ng-disabled=\"!suggestForm.$valid\">DONE</button>\n"+
            "    </div>\n"+
            "</div>\n"
        );
    })
;

var handleError = function (response) {
    alert(response.data);
    //$scope.errorMessage = response.data;
    //$('#dialogMessage').modal('show');
};

var USERS = [
    {
        "first": "Sosa",
        "last": "Rodriquez"
    },
    {
        "first": "Kristi",
        "last": "Pierce"
    },
    {
        "first": "Wolf",
        "last": "Schwartz"
    },
    {
        "first": "Hester",
        "last": "Ayala"
    },
    {
        "first": "Beck",
        "last": "Mckee"
    },
    {
        "first": "Morgan",
        "last": "Poole"
    },
    {
        "first": "Flora",
        "last": "Walter"
    },
    {
        "first": "Estela",
        "last": "Potter"
    },
    {
        "first": "Strickland",
        "last": "Martinez"
    },
    {
        "first": "Karyn",
        "last": "Macias"
    },
    {
        "first": "Erickson",
        "last": "Calhoun"
    },
    {
        "first": "Adrian",
        "last": "Goodman"
    },
    {
        "first": "Mullen",
        "last": "Stone"
    },
    {
        "first": "Dickson",
        "last": "Alvarado"
    },
    {
        "first": "Cabrera",
        "last": "Reese"
    },
    {
        "first": "Maura",
        "last": "Dotson"
    },
    {
        "first": "Meghan",
        "last": "Luna"
    },
    {
        "first": "Tucker",
        "last": "Sullivan"
    },
    {
        "first": "Salazar",
        "last": "Wade"
    },
    {
        "first": "Tasha",
        "last": "Fleming"
    },
    {
        "first": "Harding",
        "last": "Lucas"
    },
    {
        "first": "Wendi",
        "last": "Salinas"
    },
    {
        "first": "Newton",
        "last": "Lawson"
    },
    {
        "first": "Reyes",
        "last": "Slater"
    },
    {
        "first": "Marshall",
        "last": "Lott"
    },
    {
        "first": "Julie",
        "last": "Vincent"
    },
    {
        "first": "Reed",
        "last": "Daniels"
    },
    {
        "first": "Schwartz",
        "last": "Ewing"
    },
    {
        "first": "Brianna",
        "last": "Fernandez"
    },
    {
        "first": "Swanson",
        "last": "Wolf"
    },
    {
        "first": "Bonnie",
        "last": "Knowles"
    },
    {
        "first": "Shelton",
        "last": "Rasmussen"
    },
    {
        "first": "Hardin",
        "last": "Hays"
    },
    {
        "first": "Brennan",
        "last": "Trevino"
    },
    {
        "first": "Kristine",
        "last": "Dickerson"
    },
    {
        "first": "Roberson",
        "last": "Mann"
    },
    {
        "first": "Patricia",
        "last": "Wolfe"
    },
    {
        "first": "Rosanna",
        "last": "Curtis"
    },
    {
        "first": "Romero",
        "last": "Frank"
    },
    {
        "first": "Hollie",
        "last": "Newton"
    },
    {
        "first": "Tamera",
        "last": "Bolton"
    },
    {
        "first": "Mcfadden",
        "last": "Hines"
    },
    {
        "first": "Bullock",
        "last": "Ferguson"
    },
    {
        "first": "Schultz",
        "last": "Mullins"
    },
    {
        "first": "Francis",
        "last": "Lopez"
    },
    {
        "first": "Gwen",
        "last": "Foster"
    },
    {
        "first": "Lane",
        "last": "Hubbard"
    },
    {
        "first": "Susan",
        "last": "Blankenship"
    },
    {
        "first": "Gertrude",
        "last": "Garrison"
    },
    {
        "first": "Cotton",
        "last": "Hooper"
    },
    {
        "first": "Wilder",
        "last": "Malone"
    },
    {
        "first": "Hayden",
        "last": "Stout"
    },
    {
        "first": "Penny",
        "last": "Hancock"
    },
    {
        "first": "Bradley",
        "last": "Thomas"
    },
    {
        "first": "April",
        "last": "Christian"
    },
    {
        "first": "Mays",
        "last": "Hawkins"
    },
    {
        "first": "Natasha",
        "last": "Reed"
    },
    {
        "first": "Leah",
        "last": "Little"
    },
    {
        "first": "Veronica",
        "last": "Olsen"
    },
    {
        "first": "Cox",
        "last": "Whitley"
    },
    {
        "first": "Frankie",
        "last": "Warren"
    },
    {
        "first": "Carlson",
        "last": "Patterson"
    },
    {
        "first": "Katherine",
        "last": "Ryan"
    },
    {
        "first": "Andrea",
        "last": "Quinn"
    },
    {
        "first": "Minerva",
        "last": "Dale"
    },
    {
        "first": "Bryan",
        "last": "Livingston"
    },
    {
        "first": "Nichole",
        "last": "Graham"
    },
    {
        "first": "Tiffany",
        "last": "Valencia"
    },
    {
        "first": "Ellen",
        "last": "Dominguez"
    },
    {
        "first": "Karla",
        "last": "Owen"
    },
    {
        "first": "Maddox",
        "last": "Oneill"
    },
    {
        "first": "Maynard",
        "last": "Brown"
    },
    {
        "first": "Lindsay",
        "last": "Dean"
    },
    {
        "first": "Garner",
        "last": "Mcmillan"
    },
    {
        "first": "Clara",
        "last": "Bullock"
    },
    {
        "first": "Nola",
        "last": "Baxter"
    },
    {
        "first": "Jannie",
        "last": "Mcdaniel"
    },
    {
        "first": "Ethel",
        "last": "Golden"
    },
    {
        "first": "Rebecca",
        "last": "Adams"
    },
    {
        "first": "Kenya",
        "last": "Durham"
    },
    {
        "first": "Torres",
        "last": "Lindsay"
    },
    {
        "first": "Dorothy",
        "last": "Fitzpatrick"
    },
    {
        "first": "Witt",
        "last": "Ashley"
    },
    {
        "first": "Rowe",
        "last": "Levine"
    },
    {
        "first": "Munoz",
        "last": "Murphy"
    },
    {
        "first": "Berger",
        "last": "Marks"
    },
    {
        "first": "Chang",
        "last": "Burris"
    },
    {
        "first": "Leach",
        "last": "Lewis"
    },
    {
        "first": "Stout",
        "last": "England"
    },
    {
        "first": "Julia",
        "last": "Monroe"
    },
    {
        "first": "Ross",
        "last": "York"
    },
    {
        "first": "Marjorie",
        "last": "Colon"
    },
    {
        "first": "Ball",
        "last": "Wiley"
    },
    {
        "first": "Ilene",
        "last": "Berg"
    },
    {
        "first": "Agnes",
        "last": "Short"
    }
]

