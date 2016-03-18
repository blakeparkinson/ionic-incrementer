angular.module('timeincrementer', [])

.directive('timeincrementer', ['$timeout', '$interval',
  function($timeout, $interval) {
    'use strict';

    var setScopeValues = function(scope, attrs) {
      var defaultScope = {
        min: 0,
        max: 200,
        min2: 0,
        max2: 60,
        step: 1,
        val2: "0",
        prefix: undefined,
        postfix: undefined,
        postfix2: 'm',
        decimals: 0,
        stepInterval: 200,
        stepIntervalDelay: 600,
        initval: ''
      };
      angular.forEach(defaultScope, function(value, key) {
        scope[key] = attrs.hasOwnProperty(key) ? attrs[key] : value;
      });
      scope.val = attrs.value || scope.initval;

    };

    return {
      restrict: 'EA',
      require: 'ngModel',
      scope: true,
      replace: true,

      link: function(scope, element, attrs, ngModel) {
        setScopeValues(scope, attrs);

        var timeout, timer, helper = true,
          oldval = scope.val,
          oldval2 = scope.val2,
          clickStart, swipeTimer;



        scope.view = 'hours';

        var timeSettings = {
          "hours": scope.val,
          "minutes": scope.val2
        };
        ngModel.$setViewValue(timeSettings);
        ngModel.$render();

        scope.toggleView = function(view) {
          console.log(view);
          scope.view = view;
        };

        scope.decrement = function() {
          if (scope.view == 'hours') {
            oldval = scope.val;
            var value = parseFloat(parseFloat(Number(scope.val)) - parseFloat(scope.step)).toFixed(scope.decimals);

            if (value < parseInt(scope.min)) {
              value = parseFloat(scope.min).toFixed(scope.decimals);
              scope.val = value;
              scope.refreshModels(scope.val, scope.val2);
              return;
            }
            scope.val = value;
            scope.refreshModels(scope.val, scope.val2);

          } else {
            oldval = scope.val2;
            var value = parseFloat(parseFloat(Number(scope.val2)) - parseFloat(scope.step)).toFixed(scope.decimals);
            console.log(value);

            if (value < parseInt(scope.min2)) {
              value = parseFloat(scope.min2).toFixed(scope.decimals);
              scope.val2 = value;
              scope.refreshModels(scope.val1, scope.val2);
              return;
            }
            scope.val2 = value;
            scope.refreshModels(scope.val, scope.val2);

          }
        };

        scope.increment = function() {
          if (scope.view == 'hours') {

            oldval = scope.val;
            var value = parseFloat(parseFloat(Number(scope.val)) + parseFloat(scope.step)).toFixed(scope.decimals);

            if (value > parseInt(scope.max)) return;

            scope.val = value;

            scope.refreshModels(scope.val, scope.val2);
          }
          if (scope.view == 'minutes') {
            oldval2 = scope.val2;
            var value = parseFloat(parseFloat(Number(scope.val2)) + parseFloat(scope.step)).toFixed(scope.decimals);

            if (value > parseInt(scope.max2)) return;

            scope.val2 = value;
            scope.refreshModels(scope.val, scope.val2);
          }

        };

        scope.startSpinUp = function(swipe) {
          scope.checkValue();
          scope.increment();

          clickStart = Date.now();
          scope.stopSpin();
          if (swipe) {
            $timeout(function() {}, scope.stepIntervalDelay);
          } else {

            $timeout(function() {

              timer = $interval(function() {

                scope.increment();
              }, scope.stepInterval);
            }, scope.stepIntervalDelay);
          }
        };

        scope.startSpinDown = function(swipe) {

          scope.checkValue();
          scope.decrement();

          clickStart = Date.now();

          if (swipe) {
            $timeout(function() {}, scope.stepIntervalDelay);
          } else {

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
          console.log(scope.val);
          var val;
          if (scope.view == 'hours') {
            if (scope.val !== '' && !scope.val.match(/^-?(?:\d+|\d*\.\d+)$/i)) {
              val = oldval !== '' ? parseFloat(oldval).toFixed(0) : parseFloat(scope.min).toFixed(scope.decimals);
              scope.val = val;
              scope.refreshModels(scope.val, scope.val2);
            }
          } else {
            console.log(scope);
            if (scope.val2 !== '' && !scope.val2.match(/^-?(?:\d+|\d*\.\d+)$/i)) {
              val = oldval2 !== '' ? parseFloat(oldval2).toFixed(scope.decimals) : parseFloat(scope.min).toFixed(scope.decimals);
              scope.val2 = val;
              scope.refreshModels(scope.val, scope.val2);

            }
          }
        };

        scope.refreshModels = function(hourVal, minuteVal) {
          var timeSettings = {
            "hours": hourVal,
            "minutes": minuteVal
          };
          ngModel.$setViewValue(timeSettings);
          ngModel.$render();
        };
      },

      template: '<div class="incrementer">' +
        '<div class="row incrementer-row">' +
        '<a class="button button-icon icon ion-minus" on-touch="startSpinDown()" on-release="stopSpin()"></a>' +
        '  <span class="prefix" ng-show="prefix" ng-bind="prefix"></span>' +
        '<div class="input-container {{view}}" on-drag-right="startSpinDown(true)" on-drag-left="startSpinUp(true)" on-release="stopSpin(true)">' +
        '<div class="hour-container" ng-click="toggleView(&quot;hours&quot)">' +
        '<span ng-model="val" class="incrementer-value" ng-blur="checkValue()">{{val}}</span>' +
        ' <span class="postfix" ng-show="postfix" ng-bind="postfix"></span>' +
        '</div>' +
        '<div class="minute-container" ng-click="toggleView(&quot;minutes&quot)">' +
        '<span ng-model="val2" class="incrementer-value" ng-blur="checkValue()">{{val2}}</span>' +
        ' <span class="postfix" ng-show="postfix2" ng-bind="postfix2"></span>' +
        '</div>' +
        '</div>' +
        '<a class="button button-icon icon ion-plus" on-touch="startSpinUp()" on-release="stopSpin()"></a>' +
        '</div>' +
        '</div>'
    };
  }
]);
