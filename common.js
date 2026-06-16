// ============ 配置 ============
let CONTRACT_ADDRESS = 'YOUR_DEPLOYED_CONTRACT_ADDRESS';

// 加载合约编译产物和已保存部署信息
let CONTRACT_ARTIFACT = null;
(async function loadArtifact() {
  try {
    const resp = await fetch('contract-artifact.json');
    if (resp.ok) CONTRACT_ARTIFACT = await resp.json();
  } catch(e) {}
  // 从 localStorage 恢复已部署地址
  try {
    const saved = localStorage.getItem('modaDeployInfo');
    if (saved) {
      const info = JSON.parse(saved);
      if (info.contractAddress && ethers.isAddress(info.contractAddress)) {
        CONTRACT_ADDRESS = info.contractAddress;
      }
    }
  } catch(e) {}
})();

const CONTRACT_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function owner() view returns (address)",
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
  "function marketingWallet() view returns (address)",
  "function swapEnabled() view returns (bool)",
  "function swapThreshold() view returns (uint256)",
  "function isExcludedFromTax(address) view returns (bool)",
  "function getContractBalances() view returns (uint256,uint256,uint256)",
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

const BSC_RPCS = {
  '97': 'https://data-seed-prebsc-1-s1.binance.org:8545/',
  '56': 'https://bsc-dataseed1.binance.org/'
};
const PANCAKE_ROUTERS = {
  '97': '0xD99D1c33F9fC3444f8101754aBC46c52416550D1',
  '56': '0x10ED43C718714eb63d5aA57B78B54704E256024E'
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

// ============ 钱包连接 ============
async function connectWallet() {
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

    if (ethers.isAddress(CONTRACT_ADDRESS)) {
      contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const owner = await contract.owner();
      isOwner = userAddress.toLowerCase() === owner.toLowerCase();
      updateUI();
      if (typeof onWalletConnected === 'function') onWalletConnected();
    } else {
      showToast('未检测到已部署的合约，请前往「一键部署」页面部署', 'info');
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
    if (ethers.isAddress(CONTRACT_ADDRESS)) {
      contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const owner = await contract.owner();
      isOwner = userAddress.toLowerCase() === owner.toLowerCase();
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

// ============ 只读初始化 ============
async function initReadOnly() {
  if (!contract && ethers.isAddress(CONTRACT_ADDRESS)) {
    try {
      const readProvider = new ethers.JsonRpcProvider(BSC_RPCS['97'], undefined, { staticNetwork: true });
      const readContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, readProvider);
      if (!userAddress) {
        contract = readContract;
        if (typeof onWalletConnected === 'function') onWalletConnected();
        contract = null;
      }
    } catch(e) { console.log('只读模式不可用'); }
  }
}

// ============ 自动重连 ============
async function autoReconnect() {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        await connectWallet();
      }
    } catch(e) {}
  }
  await initReadOnly();
}
