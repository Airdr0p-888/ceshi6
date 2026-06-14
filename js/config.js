// ===================== 链配置 =====================
const CHAINS = {
  97: {
    name: "BSC 测试网",
    chainId: 97,
    rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545/",
    explorer: "https://testnet.bscscan.com",
    router: "0xD99D1c33F9fC3444f8101754aBC46c52416550d1",
    usdt: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd", // 测试网USDT官方地址
    wbnb: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
    WBNB: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",  // 兼容大写
    nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
    blockTime: 3,
    label: "🟡 BSC 测试网 (97)"
  },
  56: {
    name: "BSC 主网",
    chainId: 56,
    rpcUrl: "https://bsc-dataseed.binance.org/",
    explorer: "https://bscscan.com",
    router: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
    usdt: "0x55d398326f99059fF775485246999027B3197955",
    wbnb: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    WBNB: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",  // 兼容大写
    nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
    blockTime: 3,
    label: "🟢 BSC 主网 (56)"
  }
};

// 兼容旧代码：window.CONFIG.MAINNET/TESTNET/blockExplorer
window.CONFIG = {
  MAINNET: { ...CHAINS[56], WBNB: CHAINS[56].WBNB, usdt: CHAINS[56].usdt, router: CHAINS[56].router },
  TESTNET: { ...CHAINS[97], WBNB: CHAINS[97].WBNB, usdt: CHAINS[97].usdt, router: CHAINS[97].router },
  blockExplorer: (typeof window !== 'undefined' && window.ethereum)
    ? 'https://testnet.bscscan.com'  // 默认显示测试网
    : 'https://testnet.bscscan.com',
  getActiveExplorer() {
    return (window.currentChainId === 56) ? CHAINS[56].explorer : CHAINS[97].explorer;
  }
};

const SUPPORTED_CHAIN_IDS = [97, 56];

// 当前活跃链ID（全局状态）
window.currentChainId = 97;

function getChainConfig(chainId) {
  return CHAINS[chainId] || CHAINS[97];
}

function getSupportedChains() {
  return Object.values(CHAINS);
}
