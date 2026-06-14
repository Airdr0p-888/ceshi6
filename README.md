# Moda Fair Mint — BSC 发射平台

基于 `ModaFairMintToken.sol` 的完整 Web 前端，支持 BSC 测试网 (97) 和主网 (56)。

## 文件结构

```
fairmint-platform/
├── index.html          # 主页 + 部署记录
├── deploy.html         # 合约部署页
├── mint.html           # 用户 Mint 页
├── admin.html          # Owner 管理后台
└── js/
    ├── config.js       # 链配置（路由器/USDT/RPC）
    ├── abi.js          # 合约 ABI
    └── web3utils.js    # Web3 工具函数
```

## 使用流程

### 1. 准备字节码

1. 打开 [remix.ethereum.org](https://remix.ethereum.org)
2. 新建文件，粘贴 `ModaFairMintToken.sol`
3. 安装 OpenZeppelin 依赖（Solidity Compiler → 安装 @openzeppelin/contracts）
4. 编译（版本 0.8.20）
5. Compilation Details → Bytecode → 复制 `object` 字段值

### 2. 部署合约

打开 `deploy.html`：

1. 连接 MetaMask（选择目标链：测试网/主网）
2. 填写 Step 1：代币名称、符号、总量、Mint 参数
3. 填写 Step 2：税收、开盘模式
4. Step 3：粘贴字节码
5. Step 4：确认部署 → MetaMask 签名

### 3. 初始化交易对

部署成功后，点击「初始化 Pair」按钮（initPair），这一步必须在 Mint 开始前执行。

### 4. 用户 Mint

打开 `mint.html`：
- 输入合约地址（或从历史记录选择）
- 连接钱包
- BNB 模式：直接点击 Mint
- USDT 模式：先 Approve，再 Mint

### 5. 管理后台

打开 `admin.html`：
- 仅合约 Owner 可执行写操作
- 功能：开盘、税收、白/黑名单、Swap、提取、LP

## 链配置

| 参数 | BSC 测试网 (97) | BSC 主网 (56) |
|------|----------------|---------------|
| Router | 0xD99D1c33F9fC3444f8101754aBC46c52416550d1 | 0x10ED43C718714eb63d5aA57B78B54704E256024E |
| USDT | 0x337610d27c682E347C9cD60BD4b3b107C9d34dDd | 0x55d398326f99059fF775485246999027B3197955 |
| WBNB | 0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd | 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c |

## 注意事项

- 需要 MetaMask 浏览器扩展
- 测试网需要测试 BNB（从 faucet 领取）
- 部署历史保存在浏览器 localStorage，清除 Cookie 会丢失
- 字节码必须是完整的编译输出（通常 10000+ 字符）
