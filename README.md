# BananaToken — BSC 发射平台 V2

基于 `BananaToken.sol` 的完整 Web 前端，支持 BSC 测试网 (97) 和主网 (56)。**字节码已内嵌**，打开即用，无需 Remix。

## 🚀 平台特性

- **BNB 持币分红** — 卖出交易税自动累积，持有代币可主动 claim
- **8 档交易税** — 买入/卖出各 4 档（资金/流动性/分红/销毁），可独立调整
- **3 级推荐奖励** — 1/2/3 级推荐人按基点比例获 BNB 奖励
- **反机器人** — 杀块 + 开盘延迟 + 白名单
- **限额防砸盘** — 单笔/单地址上限
- **随机空投** — 每次交易给 N 个地址 1 wei
- **完整后台** — 30+ Owner 函数

## 文件结构

```
fairmint-platform/
├── index.html          # 主页 + 部署记录
├── deploy.html         # 3 步部署向导（追踪器 + 主合约）
├── mint.html           # 代币交易 / 分红领取
├── admin.html          # Owner 后台（侧边栏布局）
├── server.js           # 本地 HTTP 服务器
└── js/
    ├── config.js       # 链配置（CHAINS 字典 + 旧 CONFIG 兼容）
    ├── abi.js          # 合约 ABI + 98 个函数选择器
    ├── bytecode.js     # 合约字节码（47KB）+ 分红追踪器字节码（19KB）
    ├── ethers.min.js   # ethers.js v6.9.0（用于构造函数编码）
    ├── web3utils.js    # 自实现 web3 工具（零外部依赖）
    └── web3compat.js   # 兼容垫片（contract.methods.x().call() 风格）
```

## 部署流程

### 1. 启动本地服务

```bash
cd fairmint-platform
node server.js
# 访问 http://127.0.0.1:7788
```

> **必须通过 HTTP 访问**，不要直接 `file://` 打开，否则 MetaMask 注入和某些 API 会失效。

### 2. 部署合约

打开 `deploy.html`，3 步流程：

**Step 1: 部署 BNB 分红追踪器**
- 点击「🚀 部署分红追踪器」 → MetaMask 签名 → 拿到 tracker 地址
- 或粘贴已有的 tracker 地址
- 追踪器使用 EIP-1167 克隆模式（极低 gas），所有 BananaToken 共享

**Step 2: 配置代币参数**
- 基础信息：名称、符号、总供应量、ReceiveAddress、资金钱包
- 网络：BSC 测试网/主网 → 自动填入 Router / USDT / WBNB
- 8 档买卖税：实时显示合计（不能超过 10%）
- 限额：单笔买入/卖出、单地址持仓
- 反机器人：杀块数、开盘延迟、是否需要 launch() 手动开盘
- 推荐奖励：转账费、分红门槛、绑定金额、3 级推荐比例

**Step 3: 确认部署**
- 摘要 → 点击「🚀 确认部署」→ MetaMask 签名
- 编码使用 ethers.js v6 的 `Interface.encodeDeploy()`，正确处理 5 个动态数组

### 3. 手动开盘

合约默认 `enableOffTrade = true`（需要 launch），部署后用管理后台：

```
admin.html → 交易管理 → launch()
```

或在 BscScan 直接调用 `launch()` 函数。

### 4. 用户交易

打开 `mint.html`：
- 输入合约地址 → 查询代币信息（名称、符号、总量、税费、限速、开盘时间）
- 转账 / 领取 BNB 分红（claim()）
- 跳转到 PancakeSwap 交易

### 5. Owner 后台

打开 `admin.html`（侧边栏布局）：

| 模块 | 功能 |
|------|------|
| 交易管理 | launch()、setSwapAtAmount()、setSwapAndLiquifyEnabled() |
| 税费设置 | setTradeFee() — 8 档税一站式设置 |
| 限额设置 | setMaxBuyAmount / setMaxSellAmount / setMaxWalletAmount / setTransferFee / setAirdropNumbs |
| 反机器人 | setkb()、setSecondTime()、setInviterFee()、setInviType()、setBindAmount() |
| 白名单 | setFeeWhiteList()、setSeconedFeeWhiterList()、multi_bclist() |
| 资金管理 | setFundAddress()、setGenerateLpReceiverAddr()、withdrawBNB()、withdraw() |
| 分红设置 | updateGasForProcessing()、updateClaimWait()、updateMinimumTokenBalanceForDividends()、processDividendTracker() |
| 危险操作 | renounceOwnership()（不可逆，慎用） |

## 合约构造函数

```solidity
constructor(
    string[] stringParams,   // [name, symbol]
    address[] addressParams, // [currency, router, fundAddress, ETH, tracker, ReceiveAddress, owner]
    uint256[] numberParams,  // [totalSupply, buyFundFee, buyLiquidityFee, buyRewardFee, buyBurnFee,
                             //  sellFundFee, sellLiquidityFee, sellRewardFee, sellBurnFee,
                             //  maxBuyAmount, maxSellAmount, maxWalletAmount,
                             //  secondTime, kb, airdropNumbs, inviType, transferFee,
                             //  mushHoldNum, bindAmount]   // 共 19 个
    bool[] boolParams,       // [currencyIsEth, enableOffTrade]
    uint256[] inviters       // [500, 300, 200] = 5%/3%/2% 三级推荐奖励（基点）
)
```

## 链配置

| 参数 | BSC 测试网 (97) | BSC 主网 (56) |
|------|----------------|---------------|
| Router | `0xD99D1c33F9fC3444f8101754aBC46c52416550d1` | `0x10ED43C718714eb63d5aA57B78B54704E256024E` |
| USDT | `0x337610d27c682E347C9cD60BD4b3b107C9d34dDd` | `0x55d398326f99059fF775485246999027B3197955` |
| WBNB | `0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd` | `0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c` |

## 编译来源

```bash
cd compile-helper
npx hardhat compile
# 输出在 artifacts/contracts/BananaToken.sol/BananaToken.json
# 抽取 bytecode 和 abi 到 fairmint-platform/js/bytecode.js 和 abi.js
```

编译配置：solc 0.8.20, `viaIR: true`, optimizer 200 runs。

## 注意事项

- 需要 MetaMask 浏览器扩展
- 测试网需要测试 BNB（从 faucet 领取）
- 部署历史保存在浏览器 localStorage，清除 Cookie 会丢失
- 部署时如果提示 "out of gas"，把 MetaMask gas limit 调到 8000000 以上
- 合约地址创建后**不要立刻调用 launch()**，等 MetaMask 交易确认完再操作

## 配套工具

```bash
compile-helper/        # Hardhat 编译工程
├── contracts/BananaToken.sol           # 源合约（已复制）
├── hardhat.config.js
└── artifacts/contracts/BananaToken.sol/
    ├── BananaToken.json                # 主合约编译产物
    └── BABYTOKENDividendTracker.json   # 追踪器编译产物
```
