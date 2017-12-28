'use strict';
(function() {

    //This a wrapped dropdown element that automatically handles the particulars

    angular
        .module('firebotApp')
        .component("scriptParameterOption", {
            bindings: {
                metadata: "=",
                type: "<",
                onUpdate: '&'
            },
            template: `
            <div ng-switch="$ctrl.type">
                <div ng-switch-when="usergroup">

                </div>
                <div ng-switch-when="">
                    
                </div>
            </div>
            `,
            controller: function() {
                let ctrl = this;

                //If there is no value, supply the default.
                ctrl.$onInit = function() {
                    if (ctrl.metadata == null) {
                        ctrl.metadata = {};
                    }
                };
            }
        });
}());
