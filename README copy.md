# 多链钱包连接与交互 React 应用

这个项目是使用 [Create React App](https://github.com/facebook/create-react-app) 引导的，并添加了多链钱包连接和交互功能。

## 主要功能

- 连接以太坊兼容钱包（如 MetaMask）
- 支持多个区块链网络（以太坊主网、BNB Smart Chain、Optimism、Arbitrum One、Base、Scroll）
- 显示连接的钱包地址和原生代币余额
- 支持切换不同的区块链网络
- 支持原生代币和 ERC20 代币转账
- ERC20 代币余额查询
- 铸造 BMI 代币功能
- 提供帮助信息以指导用户如何使用应用

## 使用说明

1. 确保您的浏览器安装了 MetaMask 扩展程序。
2. 运行应用后，点击"连接钱包"按钮。
3. 在 MetaMask 弹出窗口中确认连接。
4. 连接成功后，您将看到您的钱包地址和当前网络的原生代币余额。
5. 使用下拉菜单切换不同的区块链网络。
6. 在转账部分，选择代币类型（原生代币或 ERC20 代币）。
7. 对于 ERC20 代币，输入合约地址并查询余额。
8. 输入接收地址和转账金额，然后点击"转账"按钮。
9. 如需铸造 BMI 代币，点击相应按钮并在 MetaMask 中确认交易。
10. 点击右下角的问号按钮以获取使用说明。

## 可用脚本

在项目目录中，您可以运行：

### `npm start`

在开发模式下运行应用。\
打开 [http://localhost:3000](http://localhost:3000) 在浏览器中查看。

当您进行更改时，页面将重新加载。\
您可能还会在控制台中看到任何 lint 错误。

### `npm test`

以交互式监视模式启动测试运行器。\
有关更多信息，请参阅[运行测试](https://facebook.github.io/create-react-app/docs/running-tests)部分。

### `npm run build`

将用于生产的应用程序构建到 `build` 文件夹。\
它在生产模式下正确捆绑 React 并优化构建以获得最佳性能。

构建被压缩，文件名包含哈希值。\
您的应用已准备好部署！

有关更多信息，请参阅[部署](https://facebook.github.io/create-react-app/docs/deployment)部分。

## 技术栈

- React
- ethers.js
- Tailwind CSS

## 注意事项

- 请确保在使用前已正确配置 MetaMask 并连接到所需的网络。
- 在进行任何交易之前，请仔细检查所有输入信息。
- 本应用仅用于演示目的，请勿在生产环境中使用未经充分测试和安全审计的代码。

## 了解更多

要学习 React，请查看 [React 文档](https://reactjs.org/)。

要了解 ethers.js，请访问 [ethers.js 文档](https://docs.ethers.io/)。

关于 MetaMask 的更多信息，请查看 [MetaMask 文档](https://docs.metamask.io/)。

deployment3
