// ===================== Web3 工具函数 =====================

let web3 = null;
let userAccount = null;

// 初始化 web3
async function initWeb3() {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('未检测到 MetaMask，请安装后重试');
  }
  web3 = new Web3(window.ethereum);
  return web3;
}

// 连接钱包
async function connectWallet() {
  await initWeb3();
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  userAccount = accounts[0];
  return userAccount;
}

// 获取当前账户
async function getAccount() {
  if (!web3) await initWeb3();
  const accounts = await web3.eth.getAccounts();
  return accounts[0] || null;
}

// 获取链ID
async function getChainId() {
  if (!web3) await initWeb3();
  return await web3.eth.getChainId();
}

// 切换链
async function switchChain(chainId) {
  const chain = getChainConfig(chainId);
  const hexChainId = '0x' + chainId.toString(16);
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: hexChainId }],
    });
  } catch (err) {
    if (err.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: hexChainId,
          chainName: chain.name,
          nativeCurrency: chain.nativeCurrency,
          rpcUrls: [chain.rpcUrl],
          blockExplorerUrls: [chain.explorer],
        }],
      });
    } else {
      throw err;
    }
  }
}

// 格式化地址
function shortAddr(addr) {
  if (!addr) return '-';
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

// 格式化 token 数量（18位）
function fromWei18(val) {
  if (!val) return '0';
  return web3.utils.fromWei(val.toString(), 'ether');
}

function toWei18(val) {
  return web3.utils.toWei(val.toString(), 'ether');
}

// BNB 余额
async function getBNBBalance(addr) {
  if (!web3) await initWeb3();
  const bal = await web3.eth.getBalance(addr);
  return web3.utils.fromWei(bal, 'ether');
}

// 获取合约实例
function getContract(address, abi) {
  return new web3.eth.Contract(abi, address);
}

// 等待 tx
async function waitTx(txHash, onProgress) {
  return new Promise((resolve, reject) => {
    const check = setInterval(async () => {
      try {
        const receipt = await web3.eth.getTransactionReceipt(txHash);
        if (receipt) {
          clearInterval(check);
          if (receipt.status) resolve(receipt);
          else reject(new Error('交易失败'));
        }
        if (onProgress) onProgress();
      } catch (e) {
        clearInterval(check);
        reject(e);
      }
    }, 2000);
  });
}

// Toast 通知
function showToast(msg, type = 'info', duration = 4000) {
  const colors = {
    info: '#3b82f6',
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b'
  };
  const icons = { info: 'ℹ️', success: '✅', error: '❌', warning: '⚠️' };

  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed;bottom:24px;right:24px;z-index:9999;
    background:#1e293b;color:#f1f5f9;padding:14px 20px;border-radius:10px;
    border-left:4px solid ${colors[type]};max-width:380px;word-break:break-word;
    box-shadow:0 8px 24px rgba(0,0,0,0.4);font-size:14px;line-height:1.5;
    animation:slideIn .3s ease;
  `;
  toast.innerHTML = `<span style="margin-right:8px">${icons[type]}</span>${msg}`;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity .3s'; setTimeout(() => toast.remove(), 300); }, duration);
}

// 加载状态按钮
function setLoading(btn, loading, text) {
  if (loading) {
    btn._originalText = btn.innerHTML;
    btn.innerHTML = `<span class="spinner"></span> ${text || '处理中...'}`;
    btn.disabled = true;
  } else {
    btn.innerHTML = btn._originalText || text || '确认';
    btn.disabled = false;
  }
}

// 事件监听：账户切换 / 链切换
function listenWalletEvents(onAccountChange, onChainChange) {
  if (!window.ethereum) return;
  window.ethereum.on('accountsChanged', (accounts) => {
    userAccount = accounts[0] || null;
    if (onAccountChange) onAccountChange(userAccount);
  });
  window.ethereum.on('chainChanged', (chainId) => {
    window.currentChainId = parseInt(chainId, 16);
    if (onChainChange) onChainChange(window.currentChainId);
  });
}

// 复制到剪贴板
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => showToast('已复制到剪贴板', 'success', 2000));
}

// localStorage 合约地址管理
function saveDeployedContract(chainId, address, info) {
  const key = `fairmint_deployed_${chainId}`;
  const list = JSON.parse(localStorage.getItem(key) || '[]');
  list.unshift({ address, ...info, time: Date.now() });
  if (list.length > 20) list.pop();
  localStorage.setItem(key, JSON.stringify(list));
}

function getDeployedContracts(chainId) {
  const key = `fairmint_deployed_${chainId}`;
  return JSON.parse(localStorage.getItem(key) || '[]');
}

function getLastContract(chainId) {
  const list = getDeployedContracts(chainId);
  return list[0] || null;
}
