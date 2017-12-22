'use strict';

(function() {
    angular
        .module('firebotApp')
        .directive('ngDraggable', function($document) {
            return {
                restrict: 'A',
                scope: {
                    dragOptions: '=ngDraggable'
                },
                link: function(scope, elem) {
                    let startX, startY, x = 0, y = 0,
                        start, stop, drag, containerSelector, didDrag = false;

                    let handleSelector = scope.dragOptions.handle;

                    let clickEl = elem;
                    if (handleSelector != null) {
                        clickEl = angular.element(elem[0].querySelector(handleSelector));
                    }

                    // Obtain drag options
                    if (scope.dragOptions) {
                        start = scope.dragOptions.start;
                        drag = scope.dragOptions.drag;
                        stop = scope.dragOptions.stop;
                        let id = scope.dragOptions.container;
                        if (id) {
                            containerSelector = id;
                        }
                    }

                    // Move element, within container if provided
                    function setPosition() {
                        if (!didDrag) return;

                        let container = document.querySelector(containerSelector).getBoundingClientRect();
                        if (container) {

                            let width = elem[0].offsetWidth,
                                height = elem[0].offsetHeight;

                            if (x < container.left) {
                                x = container.left;
                            } else if (x > container.right - width) {
                                x = container.right - width;
                            }
                            if (y < container.top) {
                                y = container.top;
                            } else if (y > container.bottom - height) {
                                y = container.bottom - height;
                            }
                        }

                        elem.css({
                            top: y + 'px',
                            left: x + 'px'
                        });
                    }

                    // Handle drag event
                    function mousemove(e) {
                        y = e.clientY - startY;
                        x = e.clientX - startX;
                        didDrag = true;
                        setPosition();
                        if (drag) drag(e);
                    }

                    // Unbind drag events
                    function mouseup(e) {
                        $document.unbind('mousemove', mousemove);
                        $document.unbind('mouseup', mouseup);
                        if (stop) stop(e);
                    }

                    // Bind mousedown event
                    clickEl.on('mousedown', function(e) {
                        e.preventDefault();
                        startX = e.clientX - elem[0].offsetLeft;
                        startY = e.clientY - elem[0].offsetTop;
                        $document.on('mousemove', mousemove);
                        $document.on('mouseup', mouseup);
                        if (start) start(e);
                    });

                    angular.element(window).on('resize', () => {
                        setPosition();
                    });
                }
            };
        });
}());


