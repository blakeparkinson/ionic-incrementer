angular.module('timeincrementer', [])

.directive('timeincrementer', ['$timeout', '$interval', '$rootScope',
  function($timeout, $interval, $rootScope) {
    'use strict';

    var setScopeValues = function(scope, attrs) {
      var defaultScope = {
        min: 0,
        max: 200,
        min2: 0,
        max2: 60,
        step: 1,
        initminute: "0",
        prefix: undefined,
        postfix: undefined,
        postfix2: 'm',
        decimals: 0,
        stepInterval: 200,
        stepIntervalDelay: 600,
        inithour: '',
        infinity: false,
        allowzero: false,
        imgpath: '',
        initialSelection: 'hours',
        minuteTransition: true,
        swipeInterval: 100
      };
      angular.forEach(defaultScope, function(value, key) {
        scope[key] = attrs.hasOwnProperty(key) ? attrs[key] : value;
      });
      scope.val = attrs.value || scope.inithour;
    };

    return {
      restrict: 'EA',
      require: 'ngModel',
      scope: {
        onItemChange: '&'
      },
      replace: true,

      link: function(scope, element, attrs, ngModel) {
        setScopeValues(scope, attrs);

        var timeout, timer, helper = true,
          oldval = scope.val,
          oldval2 = scope.initminute,
          clickStart, swipeTimer, activeSwipe;

        var originalmin2 = scope.min2;

        if (scope.initialSelection !== 'minutes') {
          scope.view = 'hours';
        } else {
          scope.view = scope.initialSelection;
        }

        var timeSettings = {
          "hours": scope.val,
          "minutes": scope.initminute
        };
        ngModel.$setViewValue(timeSettings);
        ngModel.$render();

        scope.toggleView = function(view) {
          scope.view = view;
        };

        $rootScope.$on('autoIncrementTime', function (event, data) {
          scope.val = data.value.hours;
          scope.initminute = data.value.minutes;
        });

        scope.decrement = function() {
          if (scope.view == 'hours') {
            oldval = scope.val;
            var value = parseFloat(parseFloat(Number(scope.val)) - parseFloat(scope.step)).toFixed(scope.decimals);

            //if they are set to 0 hours, they need to be set to min of 1 minute
            if (value == 0 && !scope.allowzero) {
              scope.min2 = 1;
              if (parseInt(scope.initminute) === 0) {
                scope.initminute = "1";
                scope.refreshModels(scope.val, scope.initminute);
              }
            } else {
              scope.min2 = parseInt(originalmin2);
            }

            if (value < parseInt(scope.min)) {
              value = parseFloat(scope.min).toFixed(scope.decimals);
              scope.val = String(value);
              scope.refreshModels(scope.val, scope.initminute);
              return;
            }

            if (scope.infinity) {
              // If we're at infinity and decrement, value goes back to max
              if (scope.showInfinity) {
                value = scope.max;
              }
              scope.showInfinity = false;
            }

            scope.val = value;
            if (scope.showInfinity) {
              scope.refreshModels(null, null, scope.showInfinity);

            } else {
              scope.refreshModels(scope.val, scope.initminute, scope.showInfinity);

            }

          } else {

            oldval = scope.initminute;
            var value = parseFloat(parseFloat(Number(scope.initminute)) - parseFloat(scope.step)).toFixed(scope.decimals);

            if (value < parseInt(scope.min2)) {
              scope.val = parseFloat(Number(scope.val));
              if (scope.val > 0) {
                if (scope.minuteTransition) {
                  value = scope.max2;
                  scope.initminute = value;
                  scope.val--;
                }
                else{
                  value = parseFloat(scope.min2).toFixed(scope.decimals);
                  scope.initminute = value;
                }
              } else {

                value = parseFloat(scope.min2).toFixed(scope.decimals);
                scope.initminute = value;
              }
              scope.refreshModels(scope.val, scope.initminute);
              return;
            } else if (value == parseInt(scope.min2) && scope.minuteTransition) {
              if (scope.val == 0) {
                value = '1';
              }
            }
            scope.initminute = value;
            if (scope.showInfinity) {
              scope.refreshModels(null, null, true);

            } else {
              scope.refreshModels(scope.val, scope.initminute, scope.showInfinity);
            }
          }
        };

        scope.increment = function() {
          if (scope.view == 'hours') {

            oldval = scope.val;
            var value = parseFloat(parseFloat(Number(scope.val)) + parseFloat(scope.step)).toFixed(scope.decimals);

            //update the min if they arent on 0 hours
            if (value !== 0) {
              scope.min2 = parseInt(originalmin2);
            }

            if (value > parseInt(scope.max)) {
              if (scope.infinity) {
                scope.showInfinity = true;
                scope.refreshModels(null, null, true);
              }
              return;
            } else {
              if (scope.infinity) {
                scope.showInfinity = false;
              }
            }

            scope.val = value;

            if (scope.showInfinity) {
              scope.refreshModels(null, null, true);
            } else {
              scope.refreshModels(scope.val, scope.initminute, scope.showInfinity);
            }

          }
          if (scope.view == 'minutes') {
            oldval2 = scope.initminute;
            var value = parseFloat(parseFloat(Number(scope.initminute)) + parseFloat(scope.step)).toFixed(scope.decimals);

            if (value > parseInt(scope.max2)) {
              if (scope.minuteTransition) {
                scope.val++;
                value = '0';
              } else {
                return;
              }
            }

            scope.initminute = value;
            scope.refreshModels(scope.val, scope.initminute);
            scope.onItemChange();

          }

        };

        scope.startSpinUp = function(swipe) {
          if (swipe){
            if (activeSwipe){
              return;
            }
            activeSwipe = true;
            $timeout(function(){
              activeSwipe = false;
            }, scope.swipeInterval);
          }
          scope.checkValue();
          scope.increment();

          clickStart = Date.now();
          scope.stopSpin();
          if (!swipe) {

            $timeout(function() {

              timer = $interval(function() {

                scope.increment();
              }, scope.stepInterval);
            }, scope.stepIntervalDelay);
          }
        };

        scope.startSpinDown = function(swipe) {
          if (swipe){
            if (activeSwipe){
              return;
            }
            activeSwipe = true;
            $timeout(function(){
              activeSwipe = false;
            }, scope.swipeInterval);
          }
          scope.checkValue();
          scope.decrement();

          clickStart = Date.now();

          if (!swipe) {

            var timeout = $timeout(function() {

              timer = $interval(function() {
                scope.decrement();
              }, scope.stepInterval);
            }, scope.stepIntervalDelay);
          }
        };

        scope.stopSpin = function() {

          if (Date.now() - clickStart > scope.stepIntervalDelay) {
            $timeout.cancel(timeout);
            $interval.cancel(timer);
          } else {
            $timeout(function() {

              $timeout.cancel(timeout);
              $interval.cancel(timer);
            }, scope.stepIntervalDelay);
          }
        };

        scope.checkValue = function() {
          var val;
          if (scope.view == 'hours') {
            if (scope.val !== '' && !String(scope.val).match(/^-?(?:\d+|\d*\.\d+)$/i)) {
              val = oldval !== '' ? parseFloat(oldval).toFixed(0) : parseFloat(scope.min).toFixed(scope.decimals);
              scope.val = val;
              scope.refreshModels(scope.val, scope.val2);
            }
          } else {

            if (scope.initminute !== '' && !scope.initminute.match(/^-?(?:\d+|\d*\.\d+)$/i)) {
              val = oldval2 !== '' ? parseFloat(oldval2).toFixed(scope.decimals) : parseFloat(scope.min).toFixed(scope.decimals);
              scope.initminute = val;
              scope.refreshModels(scope.val, scope.initminute);

            }
          }
        };

        scope.refreshModels = function(hourVal, minuteVal, isInfinite) {
          var timeSettings = {
            "hours": hourVal,
            "minutes": minuteVal,
            "isInfinite": isInfinite
          };
          ngModel.$setViewValue(timeSettings);
          ngModel.$render();
          scope.onItemChange();
        };
      },


      template: '<div class="incrementer">' +
        '<div class="row incrementer-row">' +
        '<a class="button button-icon minus" on-touch="startSpinDown()" on-release="stopSpin()">-</a>' +
        '<span class="prefix" ng-show="prefix" ng-bind="prefix"></span>' +
        '<div class="input-container {{view}}" on-drag-right="startSpinUp(true)" on-drag-left="startSpinDown(true)" on-release="stopSpin(true)">' +
        '<div class="hour-container" ng-click="toggleView(&quot;hours&quot)">' +
        '<span ng-model="val" class="incrementer-value" ng-blur="checkValue()"><span ng-if=showInfinity><img ng-src="{{imgpath}}" /></span><span ng-if=!showInfinity>{{val}}</span><span ng-if=!showInfinity class="postfix" ng-show="postfix" ng-bind="postfix"></span>' +
        '</div>' +
        '<div ng-if=!showInfinity class="minute-container" ng-click="toggleView(&quot;minutes&quot)">' +
        '<span ng-model="initminute" class="incrementer-value" ng-blur="checkValue()">{{initminute}}</span><span class="postfix" ng-show="postfix2" ng-bind="postfix2"></span>' +
        '</div>' +
        '</div>' +
        '<a class="button button-icon plus" on-touch="startSpinUp()" on-release="stopSpin()">+</a>' +
        '</div>' +
        '</div>'
    };
  }
]);
