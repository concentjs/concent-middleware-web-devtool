"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var React = require('react');

var JSONTree = require('react-json-tree')["default"];

var _require = require('immutable'),
    fromJS = _require.fromJS;

var _require2 = require('concent'),
    getState = _require2.getState;

var theme = {
  scheme: 'monokai',
  author: 'wimer hazenberg (http://www.monokai.nl)',
  base00: '#272822',
  base01: '#383830',
  base02: '#49483e',
  base03: '#75715e',
  base04: '#a59f85',
  base05: '#f8f8f2',
  base06: '#f5f4f1',
  base07: '#f9f8f5',
  base08: '#f92672',
  base09: '#fd971f',
  base0A: '#f4bf75',
  base0B: '#a6e22e',
  base0C: '#a1efe4',
  base0D: '#66d9ef',
  base0E: '#ae81ff',
  base0F: '#cc6633'
};
var toExport = module.exports = {};
var stBox = {
  position: 'fixed',
  zIndex: 9999,
  top: 0,
  right: 0,
  width: '280px',
  height: '100vh',
  backgroundColor: '#00262f',
  overflowY: 'auto'
};
var stBtn = {
  position: 'fixed',
  top: 19,
  right: 19,
  zIndex: 9999
};
var stItem = {
  color: '#57c7de',
  margin: 0,
  padding: '2px'
};
var hid = 1;

function updateModuleState(lastRootState, module, changedState) {
  var _Object$assign;

  var imuModuleState = lastRootState[module];

  if (!imuModuleState) {
    //动态注册的模块
    imuModuleState = fromJS(getState(module));
  }

  var newImuModuleState = imuModuleState;
  Object.keys(changedState).forEach(function (key) {
    newImuModuleState = imuModuleState.set(key, changedState[key]);
  });
  var newRootState = Object.assign({}, lastRootState, (_Object$assign = {}, _Object$assign[module] = newImuModuleState, _Object$assign));
  return newRootState;
}

function makeRootState() {
  var rootState = getState();
  var __rootState = {};
  Object.keys(rootState).forEach(function (moduleName) {
    __rootState[moduleName] = fromJS(rootState[moduleName]);
  });
  return __rootState;
}

var apiBridge = {
  changeState: function changeState() {}
};

var ConcentWebDevTool =
/*#__PURE__*/
function (_React$Component) {
  (0, _inheritsLoose2["default"])(ConcentWebDevTool, _React$Component);

  function ConcentWebDevTool() {
    var _this;

    _this = _React$Component.call(this) || this;
    _this.state = {
      historyStateList: [],
      show: false
    };
    _this.changeState = _this.changeState.bind((0, _assertThisInitialized2["default"])(_this));
    _this.renderHistory = _this.renderHistory.bind((0, _assertThisInitialized2["default"])(_this));
    apiBridge.changeState = _this.changeState;
    return _this;
  }

  var _proto = ConcentWebDevTool.prototype;

  _proto.componentDidMount = function componentDidMount() {
    var historyStateList = this.state.historyStateList;
    historyStateList.push({
      calledBy: '',
      modifiedModule: '',
      type: '',
      state: makeRootState()
    });
    this.setState({
      historyStateList: historyStateList
    });
  };

  _proto.changeState = function changeState(ctx) {
    var calledBy = ctx.calledBy || ctx.ccKey;
    var type = ctx.type || '';
    var modifiedModule = ctx.module;
    var historyStateList = this.state.historyStateList;
    var lastItem = historyStateList[historyStateList.length - 1];
    var lastRootState;

    if (!lastItem) {
      //已清除
      lastRootState = makeRootState();
    } else lastRootState = lastItem.state;

    var newRootState = updateModuleState(lastRootState, modifiedModule, ctx.state);
    historyStateList.push({
      calledBy: calledBy,
      modifiedModule: modifiedModule,
      type: type,
      state: newRootState
    });
    this.setState({
      historyStateList: historyStateList
    });
  };

  _proto.renderHistory = function renderHistory() {
    var viewNodes = this.state.historyStateList.map(function (v) {
      hid++;
      return React.createElement("div", {
        key: hid,
        style: {
          border: '1px solid #35aa7e',
          margin: '5px 2px'
        }
      }, React.createElement("h4", {
        style: stItem
      }, "calledBy: ", v.calledBy), React.createElement("h4", {
        style: stItem
      }, "type: ", v.type), React.createElement("h4", {
        style: stItem
      }, "modifiedModule: ", v.modifiedModule), React.createElement("div", {
        style: {
          marginTop: '-12px'
        }
      }, React.createElement(JSONTree, {
        data: v.state,
        theme: theme,
        invertTheme: false,
        shouldExpandNode: false
      })));
    });
    return viewNodes;
  };

  _proto.render = function render() {
    var _this2 = this;

    var show = this.state.show;

    if (show) {
      return React.createElement("div", {
        style: stBox
      }, React.createElement("button", {
        onClick: function onClick() {
          return _this2.setState({
            historyStateList: []
          });
        }
      }, "\u6E05\u9664"), React.createElement("button", {
        onClick: function onClick() {
          return _this2.setState({
            show: false
          });
        }
      }, "\u5173\u95ED"), this.renderHistory());
    } else {
      return React.createElement("button", {
        style: stBtn,
        onClick: function onClick() {
          return _this2.setState({
            show: true
          });
        }
      }, "\u5F00\u542F\u72B6\u6001\u8C03\u8BD5\u5DE5\u5177");
    }
  };

  return ConcentWebDevTool;
}(React.Component);

toExport.ConcentWebDevTool = ConcentWebDevTool;

toExport.concentWebDevToolMiddleware = function (ctx, next) {
  apiBridge.changeState(ctx);
  next();
};