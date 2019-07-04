### concent状态变迁调试工具
类似`redux-devtool`，`concent-middleware-web-devtool`作为中间件被引入，可以追溯整个concent引用的状态变迁过程，并允许你查看某一次状态变更是由具体那一个组件触发导致。

### 如何使用
#### npm 安装
```
npm i concent-middleware-web-devtool
```
#### 项目里引入
在runConcent.js脚本里引入中间
```
import { run } from 'concent';
import { concentWebDevToolMiddleware } from 'concent-middleware-web-devtool';


run(
  // { ... your store definition },
  {
    //配置devtool中间件
    middlewares:[concentWebDevToolMiddleware],
  }
);
```

#### 实例化UI
在顶层ReactDOM里实例化`ConcentWebDevTool`组件

```javascript
import YourApp from './YourApp';
import { ConcentWebDevTool } from './lib/concent-web-devtool';

function App(){
  return (
    <React.Fragment>
      <ConcentWebDevTool />
      <YourApp />
    </React.Fragment>
  );
}

```
