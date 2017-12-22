'use strict';
(function() {

    const electron = require('electron');
    const shell = electron.shell;

    let app = angular
        .module('firebotApp',
            ['ngAnimate', 'ngRoute', 'ui.bootstrap', 'rzModule', 'ui.select', 'ngSanitize', 'ui.select', 'ui.sortable']);

    app.controller('MainController', function($scope, $rootScope, $timeout, boardService,
        connectionService, groupsService, utilityService, settingsService, updatesService,
        eventLogService, websocketService, notificationService) {

        $rootScope.showSpinner = true;

        $scope.currentTab = "Interactive";

        $scope.navExpanded = true;

        $scope.toggleNav = function() {
            $scope.navExpanded = !$scope.navExpanded;
        };

        $scope.setTab = function(tabId) {
            $scope.currentTab = tabId.toLowerCase();
            $timeout(function () {
                $scope.$broadcast('rzSliderForceRender');
            });
            $timeout(function () {
                $scope.$broadcast('rzSliderForceRender');
            }, 50);
        };

        $scope.tabIsSelected = function(tabId) {
            return $scope.currentTab.toLowerCase() === tabId.toLowerCase();
        };

        $timeout(() => {
            notificationService.loadAllNotifications();
            notificationService.startExternalIntervalCheck();
        }, 1000);

        $scope.dragOptions = {
            container: '#conPanContr'
        };

        /**
      * rootScope functions. This means they are accessable in all scopes in the front end
      * This is probably bad form, so putting functions in rootScope shouldnt be abused too much
      */
        $rootScope.pasteClipboard = function(elementId, shouldUnfocus) {
            angular.element(`#${elementId}`).focus();
            document.execCommand('paste');
            if (shouldUnfocus === true || shouldUnfocus == null) {
                angular.element(`#${elementId}`).blur();
            }
        };

        $rootScope.copyTextToClipboard = function(text) {
            let textArea = document.createElement("textarea");
            // Place in top-left corner of screen regardless of scroll position.
            textArea.style.position = 'fixed';
            textArea.style.top = 0;
            textArea.style.left = 0;

            // Ensure it has a small width and height. Setting to 1px / 1em
            // doesn't work as this gives a negative w/h on some browsers.
            textArea.style.width = '2em';
            textArea.style.height = '2em';

            // We don't need padding, reducing the size if it does flash render.
            textArea.style.padding = 0;

            // Clean up any borders.
            textArea.style.border = 'none';
            textArea.style.outline = 'none';
            textArea.style.boxShadow = 'none';

            // Avoid flash of white box if rendered for any reason.
            textArea.style.background = 'transparent';


            textArea.value = text;

            document.body.appendChild(textArea);

            textArea.select();

            try {
                let successful = document.execCommand('copy');
                let msg = successful ? 'successful' : 'unsuccessful';
                console.log('Copying text command was ' + msg);
            } catch (err) {
                console.log('Oops, unable to copy');
            }

            document.body.removeChild(textArea);
        };

        $rootScope.openLinkExternally = function(url) {
            shell.openExternal(url);
        };

        /*
      * MANAGE LOGINS MODAL
      */
        $scope.showManageLoginsModal = function() {
            let showManageLoginsModal = {
                templateUrl: "manageLoginsModal.html",
                // This is the controller to be used for the modal.
                controllerFunc: ($scope, $uibModalInstance, connectionService) => {
                    $scope.accounts = connectionService.accounts;

                    // Login Kickoff
                    $scope.loginOrLogout = function(type) {
                        connectionService.loginOrLogout(type);
                    };

                    // When the user clicks "Save", we want to pass the id back to interactiveController
                    $scope.close = function() {
                        $uibModalInstance.close();
                    };

                    // When they hit cancel or click outside the modal, we dont want to do anything
                    $scope.dismiss = function() {
                        $uibModalInstance.dismiss('cancel');
                    };
                }
            };
            utilityService.showModal(showManageLoginsModal);
        };

        /*
      * ABOUT FIREBOT MODAL
      */
        $scope.showAboutFirebotModal = function() {
            let addBoardModalContext = {
                templateUrl: "aboutFirebotModal.html",
                // This is the controller to be used for the modal.
                controllerFunc: ($scope, $uibModalInstance) => {
                    // The model for the board id text field
                    $scope.version = electron.remote.app.getVersion();

                    // When the user clicks "Save", we want to pass the id back to interactiveController
                    $scope.close = function() {
                        $uibModalInstance.close();
                    };

                    // When they hit cancel or click outside the modal, we dont want to do anything
                    $scope.dismiss = function() {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'sm'
            };
            utilityService.showModal(addBoardModalContext);
        };

        /**
      * Initial App Load
      */
        /**
      * Login preview stuff
      */
        $scope.accounts = connectionService.accounts;

        // Run loadLogin to update the UI on page load.
        connectionService.loadLogin();

        if (settingsService.hasJustUpdated()) {
            utilityService.showUpdatedModal();
            settingsService.setJustUpdated(false);
        } else if (settingsService.isFirstTimeUse()) {
            utilityService.showSetupWizard();
            settingsService.setFirstTimeUse(false);
        }


        /**
      * Connection stuff
      */
        $scope.connService = connectionService;

        // Interactive
        $scope.getConnectionMessage = function() {
            let message = "";
            if (connectionService.waitingForStatusChange) {
                message = connectionService.connectedToInteractive ? 'Disconnecting...' : 'Connecting...';
            } else {
                message = connectionService.connectedToInteractive ? 'Connected' : 'Disconnected';
            }
            return message;
        };
        // Chat
        $scope.getChatConnectionMessage = function() {
            let message = "";
            if (connectionService.waitingForChatStatusChange) {
                message = connectionService.connectedToChat ? 'Disconnecting...' : 'Connecting...';
            } else {
                message = connectionService.connectedToChat ? 'Connected' : 'Disconnected';
            }
            return message;
        };

        // Get app version and change titlebar.
        let appVersion = electron.remote.app.getVersion();
        let version = appVersion;
        $scope.appTitle = 'Firebot Interactive || v' + version + ' || @FirebotApp';

        //Attempt to load viewer groups into memory
        groupsService.loadViewerGroups();

        //check for updates
        // Get update information if we havent alreday
        if (!updatesService.hasCheckedForUpdates) {
            updatesService.checkForUpdate().then((updateData) => {
                $scope.updateIsAvailable = updateData.updateIsAvailable;
            });
        }

        //make sure sliders render properly
        $timeout(function () {
            $scope.$broadcast('rzSliderForceRender');
        }, 250);

        // Apply Theme
        $scope.appTheme = function() {
            return settingsService.getTheme();
        };

        $rootScope.showSpinner = false;
    });

    app.config(['$routeProvider', '$locationProvider', function($routeProvider) {
        $routeProvider

        // route for the interactive tab
            .when('/', {
                templateUrl: './templates/interactive/_interactive.html',
                controller: 'interactiveController'
            })

        // route for the viewer groups page
            .when('/groups', {
                templateUrl: './templates/_viewergroups.html',
                controller: 'groupsController'
            })

        // route for the moderation page
            .when('/commands', {
                templateUrl: './templates/chat/_commands.html',
                controller: 'commandsController'
            })

        // route for the moderation page
            .when('/moderation', {
                templateUrl: './templates/_moderation.html',
                controller: 'moderationController'
            })

        // route for the settings page
            .when('/settings', {
                templateUrl: './templates/_settings.html',
                controller: 'settingsController'
            })

        // route for the updates page
            .when('/updates', {
                templateUrl: './templates/_updates.html',
                controller: 'updatesController'
            });
    }]);

    // This adds a filter that we can use for ng-repeat, useful when we want to paginate something
    app.filter('startFrom', function() {
        return function(input, startFrom) {
            startFrom = +startFrom;
            return input.slice(startFrom);
        };
    });
}(angular));
