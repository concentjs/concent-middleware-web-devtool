
var React = require('react');
var JSONTree = require('react-json-tree').default;
var { fromJS } = require('immutable');
var { getState } = require('concent');

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
  position: 'fixed', zIndex: 9999, top: 0, right: 0, width: '280px', height: '100vh',
  backgroundColor: '#00262f', overflowY: 'auto',
}
var stBtn = { position: 'fixed', top: 19, right: 19, zIndex: 9999 };
var stItem = { color: '#57c7de', margin: 0, padding: '2px' };
var hid = 1;

function updateModuleState(lastRootState, module, changedState) {
  var imuModuleState = lastRootState[module];
  if (!imuModuleState) {//动态注册的模块
    imuModuleState = fromJS(getState(module));
  }

  var newImuModuleState = imuModuleState;
  Object.keys(changedState).forEach(key => {
    newImuModuleState = imuModuleState.set(key, changedState[key]);
  });

  var newRootState = Object.assign({}, lastRootState, { [module]: newImuModuleState });
  return newRootState;
}

function makeRootState() {
  var rootState = getState();
  var __rootState = {};
  Object.keys(rootState).forEach(moduleName => {
    __rootState[moduleName] = fromJS(rootState[moduleName]);
  });
  return __rootState;
}

const apiBridge = {
  changeState: () => { }
};

class ConcentWebDevTool extends React.Component {
  constructor() {
    super();
    this.state = {
      historyStateList: [],
      show: false,
    };
    this.changeState = this.changeState.bind(this);
    this.renderHistory = this.renderHistory.bind(this);
    apiBridge.changeState = this.changeState;
  }

  componentDidMount() {
    var historyStateList = this.state.historyStateList;
    historyStateList.push({
      calledBy: '',
      modifiedModule: '',
      type: '',
      state: makeRootState(),
    });
    this.setState({ historyStateList: historyStateList });
  }

  changeState(ctx){
    var calledBy = ctx.calledBy || ctx.ccKey;
    var type = ctx.type || '';
    var modifiedModule = ctx.module;
    var historyStateList = this.state.historyStateList;
    var lastItem = historyStateList[historyStateList.length - 1];

    var lastRootState;
    if (!lastItem) {//已清除
      lastRootState = makeRootState();
    } else lastRootState = lastItem.state;

    var newRootState = updateModuleState(lastRootState, modifiedModule, ctx.state)

    historyStateList.push({
      calledBy: calledBy,
      modifiedModule: modifiedModule,
      type,
      state: newRootState,
    });
    this.setState({ historyStateList });
  }

  renderHistory() {
    var viewNodes = this.state.historyStateList.map((v) => {
      hid++;
      return (
        <div key={hid} style={{ border: '1px solid #35aa7e', margin: '5px 2px' }}>
          <h4 style={stItem}>calledBy: {v.calledBy}</h4>
          <h4 style={stItem}>type: {v.type}</h4>
          <h4 style={stItem}>modifiedModule: {v.modifiedModule}</h4>
          <div style={{ marginTop: '-12px' }}>
            <JSONTree data={v.state} theme={theme} invertTheme={false} shouldExpandNode={false} />
          </div>
        </div>
      );
    });
    return viewNodes;
  }
  render() {
    var show = this.state.show;
    if (show) {
      return (
        <div style={stBox}>
          <button onClick={() => this.setState({ historyStateList: [] })}>清除</button>
          <button onClick={() => this.setState({ show: false })}>关闭</button>
          {this.renderHistory()}
        </div>
      )
    } else {
      return <button style={stBtn} onClick={() => this.setState({ show: true })}>开启状态调试工具</button>
    }

  }
}

toExport.ConcentWebDevTool = ConcentWebDevTool;

toExport.concentWebDevToolMiddleWare = function (ctx, next) {
  apiBridge.changeState(ctx);
  next();
}

