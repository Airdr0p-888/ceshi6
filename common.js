// ============ 多代币管理 ============
const TOKENS_KEY = 'modaTokens';
let currentTokenAddress = null;

function getTokenList() {
  try {
    return JSON.parse(localStorage.getItem(TOKENS_KEY) || '[]');
  } catch(e) { return []; }
}

function saveTokenList(list) {
  localStorage.setItem(TOKENS_KEY, JSON.stringify(list));
}

function addTokenToLocal(info) {
  const list = getTokenList();
  // 去重（按地址）
  const idx = list.findIndex(t => t.address.toLowerCase() === info.address.toLowerCase());
  const entry = {
    address: info.address,
    name: info.name || '',
    symbol: info.symbol || '',
    deployTime: info.deployTime || Date.now(),
    chainId: info.chainId || '97',
    mintMode: info.mintMode,
    mintPrice: info.mintPrice,
    tokenPerMint: info.tokenPerMint,
    maxMintCount: info.maxMintCount
  };
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...entry };
  } else {
    list.unshift(entry);
  }
  saveTokenList(list);
  return list;
}

function removeTokenFromLocal(address) {
  const list = getTokenList().filter(t => t.address.toLowerCase() !== address.toLowerCase());
  saveTokenList(list);
  return list;
}

function getTokenInfo(address) {
  return getTokenList().find(t => t.address.toLowerCase() === address.toLowerCase());
}

// ============ 合约 Artifact ============
// 通过 getter 动态读取异步加载的结果，兼容同步引用
Object.defineProperty(window, 'CONTRACT_ARTIFACT', {
  get() { return window._artifact || null; },
  configurable: true
});
(async function loadArtifact() {
  try {
    const resp = await fetch('contract-artifact.json');
    if (resp.ok) window._artifact = await resp.json();
  } catch(e) { console.warn('Artifact 加载失败:', e.message); }
  // 同时加载 Factory artifact
  try {
    const resp2 = await fetch('vanity-factory-artifact.json');
    if (resp2.ok) window._factoryArtifact = await resp2.json();
  } catch(e) { console.warn('Factory Artifact 加载失败:', e.message); }
})();

const CONTRACT_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function owner() view returns (address)",
  "function renounceOwnership()",
  "function transferOwnership(address)",
  "function pair() view returns (address)",
  "function router() view returns (address)",
  "function mintEnabled() view returns (bool)",
  "function mintedCount() view returns (uint256)",
  "function maxMintCount() view returns (uint256)",
  "function mintPrice() view returns (uint256)",
  "function tokenPerMint() view returns (uint256)",
  "function userMintShare() view returns (uint256)",
  "function lpFundShare() view returns (uint256)",
  "function mintMode() view returns (uint8)",
  "function hasMinted(address) view returns (bool)",
  "function whitelistEnabled() view returns (bool)",
  "function whitelist(address) view returns (bool)",
  "function blacklist(address) view returns (bool)",
  "function mintBNB() payable",
  "function mintUSDT()",
  "function tradingOpen() view returns (bool)",
  "function launchMode() view returns (uint8)",
  "function launchTime() view returns (uint256)",
  "function openTrading()",
  "function buyTax() view returns (uint256)",
  "function sellTax() view returns (uint256)",
  "function transferTax() view returns (uint256)",
  "function marketingShare() view returns (uint256)",
  "function burnShare() view returns (uint256)",
  "function lpShare() view returns (uint256)",
  "function dividendShare() view returns (uint256)",
  "function dividendEnabled() view returns (bool)",
  "function marketingWallet() view returns (address)",
  "function swapEnabled() view returns (bool)",
  "function swapThreshold() view returns (uint256)",
  "function isExcludedFromTax(address) view returns (bool)",
  "function getContractBalances() view returns (uint256,uint256,uint256)",
  "function depositDividend() payable",
  "function depositDividendUSDT(uint256)",
  "function claimDividends()",
  "function pendingDividends(address) view returns (uint256)",
  "function setDividendEnabled(bool)",
  "function setDividendShare(uint256)",
  "function getDividendInfo() view returns (bool,uint256,uint256,uint256,uint256)",
  "function getMintInfo() view returns (bool,uint256,uint256,uint256,uint256,uint256,uint8)",
  "function getTaxInfo() view returns (uint256,uint256,uint256,uint256,uint256,uint256)",
  "function getTradingStatus() view returns (bool,bool,uint8,uint256)",
  "function getUserMintStatus(address) view returns (bool,bool,bool)",
  "function pause()",
  "function unpause()",
  "function withdrawBNB(uint256)",
  "function withdrawToken(address,uint256)",
  "function forceSwapBack()",
  "function setMintEnabled(bool)",
  "function setMintPrice(uint256)",
  "function setTokenPerMint(uint256)",
  "function setMaxMintCount(uint256)",
  "function setLaunchTime(uint256)",
  "function setWhitelistEnabled(bool)",
  "function setWhitelist(address[],bool)",
  "function setBlacklist(address[],bool)",
  "function setBuyTax(uint256)",
  "function setSellTax(uint256)",
  "function setTransferTax(uint256)",
  "function setMarketingShare(uint256)",
  "function setBurnShare(uint256)",
  "function setLpShare(uint256)",
  "function setMarketingWallet(address)",
  "function setSwapEnabled(bool)",
  "function setSwapThreshold(uint256)",
  "function setExcludedFromTax(address,bool)",
  "function usdtAddress() view returns (address)",
  "function approve(address,uint256) returns (bool)",
  "function allowance(address,address) view returns (uint256)",
  "event Minted(address indexed user, uint256 amount, uint256 price, uint256 lpAdded)",
  "event TradingOpened(uint256 timestamp)",
];

const USDT_ABI = [
  "function approve(address,uint256) returns (bool)",
  "function allowance(address,address) view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

// ============ VanityFactory ============
const VANITY_FACTORY_ABI = [
  "function predictAddress(bytes32 salt, bytes calldata bytecode) view returns (address)",
  "function deploy(bytes32 salt, bytes calldata bytecode) returns (address)",
  "function owner() view returns (address)",
  "function transferOwnership(address newOwner)",
  "function renounceOwnership()",
  "function withdrawBNB(address payable to, uint256 amount)",
  "function withdrawToken(address token, address to, uint256 amount)",
  "event TokenDeployed(address indexed tokenAddress, address indexed owner, bytes32 salt, uint256 saltUint)"
];

// Factory 合约地址（部署后填入，各链独立部署）
const VANITY_FACTORY_ADDRESSES = {
  '97': '0x0000000000000000000000000000000000000000', // BSC 测试网 — 待部署
  '56': '0x0000000000000000000000000000000000000000', // BSC 主网 — 待部署
};

const BSC_RPCS = {
  '97': 'https://bsc-testnet-dataseed.bnbchain.org',
  '56': 'https://bsc-dataseed.bnbchain.org'
};

const PANCAKE_ROUTERS = {
  '97': '0xD99D1c33F9fC3444f8101754aBC46c52416550D1', // BSC Testnet PancakeSwap Router
  '56': '0x10ED43C718714eb63d5aA57B78B54704E256024E'  // BSC Mainnet PancakeSwap Router
};

// ============ 全局状态 ============
let provider = null;
let signer = null;
let contract = null;
let userAddress = null;
let isOwner = false;

// ============ Toast ============
function showToast(msg, type) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ============ 动态合约地址 ============
function setContractAddress(addr) {
  currentTokenAddress = addr;
  if (userAddress && signer && ethers.isAddress(addr)) {
    contract = new ethers.Contract(addr, CONTRACT_ABI, signer);
  }
}

// ============ 钱包连接 ============
async function connectWallet(targetAddress) {
  if (!window.ethereum) {
    showToast('请先安装 MetaMask 钱包！', 'error');
    return;
  }
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    userAddress = accounts[0];
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();

    updateUI();
    showToast('钱包连接成功！', 'success');

    const addr = targetAddress || currentTokenAddress;
    if (ethers.isAddress(addr)) {
      contract = new ethers.Contract(addr, CONTRACT_ABI, signer);
      currentTokenAddress = addr;
      try {
        const owner = await contract.owner();
        isOwner = userAddress.toLowerCase() === owner.toLowerCase();
      } catch(e) { isOwner = false; }
      updateUI();
      if (typeof onWalletConnected === 'function') onWalletConnected();
    } else {
      if (typeof onWalletConnected === 'function') onWalletConnected();
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', () => window.location.reload());
  } catch (err) {
    console.error(err);
    showToast('连接失败：' + err.message, 'error');
  }
}

function disconnectWallet() {
  userAddress = null;
  provider = null;
  signer = null;
  contract = null;
  isOwner = false;
  if (window.ethereum) {
    window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
  }
  updateUI();
  if (typeof onWalletDisconnected === 'function') onWalletDisconnected();
  showToast('钱包已断开连接', 'info');
}

async function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    disconnectWallet();
  } else {
    userAddress = accounts[0];
    signer = await provider.getSigner();
    const addr = currentTokenAddress;
    if (ethers.isAddress(addr)) {
      contract = new ethers.Contract(addr, CONTRACT_ABI, signer);
      try {
        const owner = await contract.owner();
        isOwner = userAddress.toLowerCase() === owner.toLowerCase();
      } catch(e) { isOwner = false; }
      updateUI();
      if (typeof onWalletConnected === 'function') onWalletConnected();
    }
  }
}

function updateUI() {
  const btnConnect = document.getElementById('btnConnect');
  const btnDisconnect = document.getElementById('btnDisconnect');
  const addressBadge = document.getElementById('addressBadge');
  const chainBadge = document.getElementById('chainBadge');

  if (userAddress) {
    if (btnConnect) btnConnect.classList.add('hidden');
    if (btnDisconnect) btnDisconnect.classList.remove('hidden');
    if (addressBadge) { addressBadge.classList.remove('hidden'); addressBadge.textContent = userAddress.slice(0,6) + '...' + userAddress.slice(-4); }
    if (chainBadge) chainBadge.classList.remove('hidden');
    if (typeof onOwnerChanged === 'function') onOwnerChanged(isOwner);
  } else {
    if (btnConnect) btnConnect.classList.remove('hidden');
    if (btnDisconnect) btnDisconnect.classList.add('hidden');
    if (addressBadge) addressBadge.classList.add('hidden');
    if (chainBadge) chainBadge.classList.add('hidden');
    if (typeof onOwnerChanged === 'function') onOwnerChanged(false);
  }
}

// ============ 只读初始化（无钱包时，用 RPC 读取） ============
async function initReadOnly(addr) {
  const target = addr || currentTokenAddress;
  if (!contract && ethers.isAddress(target)) {
    try {
      // 先尝试从 localStorage 获取保存的 chainId
      const saved = getTokenInfo(target);
      let chainId = saved ? String(saved.chainId) : '97';

      // 如果有钱包，读实际链 ID
      if (window.ethereum) {
        try {
          const raw = await window.ethereum.request({method:'eth_chainId'});
          chainId = String(parseInt(raw, 16));
        } catch(e) {}
      }

      const rpcUrl = BSC_RPCS[chainId] || BSC_RPCS['97'];
      console.log('只读模式 RPC:', rpcUrl, 'chainId:', chainId);
      const readProvider = new ethers.JsonRpcProvider(rpcUrl);
      contract = new ethers.Contract(target, CONTRACT_ABI, readProvider);
      currentTokenAddress = target;

      // 快速验证合约存在
      try {
        await contract.name();
      } catch(e) {
        console.warn('合约读取失败，可能是地址无效或网络不匹配:', e.message);
        contract = null;
        if (typeof onLoadFailed === 'function') onLoadFailed('无法读取合约，请确认地址正确且网络匹配');
        return;
      }

      if (typeof onWalletConnected === 'function') onWalletConnected();
    } catch(e) {
      console.log('只读模式不可用:', e.message);
      if (typeof onLoadFailed === 'function') onLoadFailed('网络连接失败，请检查网络后重试');
    }
  }
}

// ============ 自动重连 ============
async function autoReconnect(targetAddress) {
  if (targetAddress) {
    currentTokenAddress = targetAddress;
  } else {
    // 尝试从 URL 参数获取
    const params = new URLSearchParams(window.location.search);
    const addrParam = params.get('address');
    if (ethers.isAddress(addrParam)) {
      currentTokenAddress = addrParam;
    }
  }

  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        await connectWallet(currentTokenAddress);
        return;
      }
    } catch(e) {}
  }
  // 没有钱包连接，尝试只读模式
  await initReadOnly(currentTokenAddress);
}
