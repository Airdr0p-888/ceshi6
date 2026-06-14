// ===================== 纯 MetaMask RPC 工具库 (零外部依赖) =====================
// 直接通过 window.ethereum.request 发送 JSON-RPC
// 函数签名尽量兼容原 web3utils.js，业务页面改动最小
// 依赖: js/abi.js 必须先加载（提供 CONTRACT_ABI / CONSTRUCTOR_INPUTS / SELECTORS）

let userAccount = null;
let currentChainId = null;

// ─────── JSON-RPC 基础 ───────
async function ethRpc(method, params = []) {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('未检测到 MetaMask！请安装: https://metamask.io/download/');
  }
  return await window.ethereum.request({ method, params });
}

// ─────── 初始化 / 连接钱包 ───────
async function initWeb3() {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('未检测到 MetaMask！请安装浏览器扩展: https://metamask.io/download/');
  }
  return true;
}

async function connectWallet() {
  await initWeb3();
  try {
    const accounts = await ethRpc('eth_requestAccounts');
    if (!accounts || accounts.length === 0) throw new Error('用户拒绝了连接请求');
    userAccount = accounts[0];
    currentChainId = parseInt(await ethRpc('eth_chainId'), 16);
    return userAccount;
  } catch (e) {
    if (e.code === 4001) throw new Error('用户取消了连接');
    if (e.code === -32002) throw new Error('MetaMask 已有待处理请求，请打开 MetaMask 扩展');
    throw e;
  }
}

async function getAccount() {
  const accs = await ethRpc('eth_accounts');
  return accs[0] || null;
}
async function getChainId() {
  return parseInt(await ethRpc('eth_chainId'), 16);
}

// ─────── 切换链 ───────
async function switchChain(chainId) {
  const cfg = getChainConfig(chainId);
  const hex = '0x' + chainId.toString(16);
  try {
    await ethRpc('wallet_switchEthereumChain', [{ chainId: hex }]);
  } catch (err) {
    if (err.code === 4902) {
      await ethRpc('wallet_addEthereumChain', [{
        chainId: hex,
        chainName: cfg.name,
        nativeCurrency: cfg.nativeCurrency,
        rpcUrls: [cfg.rpcUrl],
        blockExplorerUrls: [cfg.explorer],
      }]);
    } else throw err;
  }
}

// ─────── 工具函数 ───────
function shortAddr(a) { return a ? a.slice(0, 6) + '...' + a.slice(-4) : '-'; }

function fromWei18(v) {
  if (v === null || v === undefined) return '0';
  const s = BigInt(v).toString().padStart(19, '0');
  const intPart = s.slice(0, -18);
  let frac = s.slice(-18).replace(/0+$/, '');
  return frac ? intPart + '.' + frac : intPart;
}

function toWei18(v) {
  if (v === null || v === undefined) return '0';
  const s = v.toString();
  const parts = s.split('.');
  const intPart = parts[0] || '0';
  const frac = (parts[1] || '').padEnd(18, '0').slice(0, 18);
  return (BigInt(intPart) * BigInt('1000000000000000000') + BigInt(frac)).toString();
}

async function getBNBBalance(addr) {
  const bal = await ethRpc('eth_getBalance', [addr, 'latest']);
  return fromWei18(bal);
}

// ─────── 编码器 (符合 ABI 规范) ───────
function pad32(hex) {
  hex = hex.replace(/^0x/, '');
  return hex.padStart(Math.ceil(hex.length / 64) * 64, '0');
}
function padAddr(a) {
  if (!a) throw new Error('地址不能为空');
  a = a.toLowerCase().replace(/^0x/, '');
  if (a.length !== 40) throw new Error('地址格式错误: ' + a);
  return a.padStart(64, '0');
}
function padUint(v) {
  if (v === '' || v === null || v === undefined) throw new Error('数字不能为空');
  let n;
  try {
    n = BigInt(v.toString().replace(/_/g, ''));
  } catch (e) {
    throw new Error('数字格式错误: ' + v);
  }
  if (n < 0) throw new Error('不能为负数: ' + v);
  return n.toString(16).padStart(64, '0');
}
function padBool(b) { return padUint(b ? '1' : '0'); }
function utf8Hex(s) {
  const bytes = new TextEncoder().encode(s);
  let hex = '';
  for (const b of bytes) hex += b.toString(16).padStart(2, '0');
  return hex;
}

// 标准 ABI 编码：types + values（支持 uint8..uint256, address, bool, string, address[]）
function abiEncode(types, values) {
  const isDynamic = t => t === 'string' || t === 'bytes' || t.endsWith('[]');
  const encoders = {
    'address': (v) => padAddr(v),
    'bool': (v) => padBool(v),
  };
  for (let i = 8; i <= 256; i += 8) {
    encoders['uint' + i] = (v) => padUint(v);
    encoders['int' + i] = (v) => padUint(BigInt(v) & ((BigInt(1) << BigInt(i)) - BigInt(1)));
  }
  encoders['bytes32'] = (v) => v.replace(/^0x/, '').padStart(64, '0');

  // 1) 编码所有固定类型到 head，动态类型记录 offset
  const head = [];
  const tail = [];
  let dynamicOffset = types.length * 32; // 每个类型在 head 占 32 字节

  for (let i = 0; i < types.length; i++) {
    const t = types[i];
    const v = values[i];
    if (t.endsWith('[]')) {
      head.push(padUint(BigInt(dynamicOffset)));
      const innerType = t.slice(0, -2);
      const arr = v || [];
      const arrLen = arr.length;
      let arrBytes = padUint(arrLen);
      for (const item of arr) {
        if (innerType === 'address') arrBytes += padAddr(item);
        else if (innerType === 'bool') arrBytes += padBool(item);
        else if (innerType.startsWith('uint') || innerType.startsWith('int')) arrBytes += padUint(item);
        else if (innerType === 'string') {
          const hex = utf8Hex(item);
          arrBytes += padUint(hex.length / 2);
          arrBytes += hex.padEnd(Math.ceil(hex.length / 64) * 64, '0');
        }
      }
      tail.push(arrBytes);
      dynamicOffset += Math.ceil(arrBytes.length / 64) * 64;
    } else if (isDynamic(t)) {
      head.push(padUint(dynamicOffset));
      const hex = t === 'string' ? utf8Hex(v) : v.replace(/^0x/, '');
      let itemBytes = padUint(hex.length / 2) + hex;
      itemBytes = itemBytes.padEnd(Math.ceil(itemBytes.length / 64) * 64, '0');
      tail.push(itemBytes);
      dynamicOffset += Math.ceil(itemBytes.length / 64) * 64;
    } else {
      if (!encoders[t]) throw new Error('不支持的 ABI 类型: ' + t);
      head.push(encoders[t](v));
    }
  }

  return '0x' + head.join('') + tail.join('');
}

// ─────── 函数调用编码 ───────
function encodeCall(abi, methodName, args) {
  const entry = abi.find(e => e.name === methodName && e.type === 'function');
  if (!entry) throw new Error('ABI 中未找到函数: ' + methodName);
  const types = entry.inputs.map(i => i.type);
  const sig = methodName + '(' + types.join(',') + ')';
  const selector = SELECTORS[sig];
  if (!selector) throw new Error('未找到函数选择器: ' + sig);
  if (entry.inputs.length === 0) return selector;
  const encoded = abiEncode(types, args);
  return selector + encoded.slice(2);
}

// ─────── 部署合约 ───────
async function deployContract(bytecode, constructorArgs, onDeploy) {
  await initWeb3();
  const account = userAccount || await connectWallet();
  if (!window.CONSTRUCTOR_INPUTS) throw new Error('abi.js 未加载');

  const types = CONSTRUCTOR_INPUTS.map(i => i.type);
  const encodedArgs = abiEncode(types, constructorArgs);
  const data = (bytecode.startsWith('0x') ? bytecode : '0x' + bytecode) + encodedArgs.slice(2);

  const txParams = { from: account, data: data, gas: '0x9C4000' }; // 10,000,000

  showToast('请在 MetaMask 中确认部署交易...', 'info', 300000);
  const txHash = await ethRpc('eth_sendTransaction', [txParams]);
  if (onDeploy) onDeploy(txHash);

  return await waitForDeployment(txHash);
}

async function waitForDeployment(txHash) {
  return new Promise((resolve, reject) => {
    const timer = setInterval(async () => {
      try {
        const receipt = await ethRpc('eth_getTransactionReceipt', [txHash]);
        if (receipt) {
          clearInterval(timer);
          if (receipt.status === '0x1' || receipt.status === true) {
            resolve({ address: receipt.contractAddress, txHash });
          } else {
            reject(new Error('部署交易失败 (status=0)'));
          }
        }
      } catch (e) { clearInterval(timer); reject(e); }
    }, 3000);
    setTimeout(() => { clearInterval(timer); reject(new Error('等待超时 (5分钟)')); }, 300000);
  });
}

// ─────── 合约 read/write ───────
async function contractCall(contractAddr, method, args = []) {
  const data = encodeCall(CONTRACT_ABI, method, args);
  const result = await ethRpc('eth_call', [{ to: contractAddr, data: data }, 'latest']);
  return decodeResult(method, result);
}

async function contractTx(contractAddr, method, args = [], value = '0', options = {}) {
  const data = encodeCall(CONTRACT_ABI, method, args);
  const params = {
    from: userAccount,
    to: contractAddr,
    data: data,
  };
  if (value && value !== '0') params.value = '0x' + BigInt(value).toString(16);
  if (options.gas) params.gas = options.gas;
  return await ethRpc('eth_sendTransaction', [params]);
}

function getContract(address) {
  // 提供与 ethers 兼容的接口
  return new Proxy({}, {
    get(_, method) {
      return function(...args) {
        // 优先用 ABI 判断可变性
        const entry = CONTRACT_ABI.find(e => e.name === method && e.type === 'function');
        if (!entry) return Promise.reject(new Error('ABI 未找到方法: ' + method));
        if (entry.stateMutability === 'view' || entry.stateMutability === 'pure') {
          return contractCall(address, method, args);
        }
        // write: 可选 value
        if (args.length > entry.inputs.length) {
          const value = args.pop();
          return contractTx(address, method, args, value);
        }
        return contractTx(address, method, args);
      };
    }
  });
}

function decodeResult(method, hex) {
  if (!hex || hex === '0x' || hex === '0x0') return null;
  const entry = CONTRACT_ABI.find(e => e.name === method && e.type === 'function');
  if (!entry || !entry.outputs || entry.outputs.length === 0) return null;

  // 简化：只支持单返回值
  if (entry.outputs.length === 1) {
    const t = entry.outputs[0].type;
    hex = hex.replace(/^0x/, '');
    if (t === 'uint256' || t.startsWith('uint')) return BigInt('0x' + hex.slice(-64)).toString();
    if (t === 'int256' || t.startsWith('int')) {
      const n = BigInt('0x' + hex.slice(-64));
      const max = (BigInt(1) << BigInt(parseInt(t.slice(3)) || 256)) - BigInt(1);
      return n > max / 2 ? (n - max - BigInt(1)).toString() : n.toString();
    }
    if (t === 'address') return '0x' + hex.slice(-40).toLowerCase();
    if (t === 'bool') return hex.slice(-1) === '1';
  }
  return hex; // 多返回值返回原始 hex
}

// ─────── 等待交易确认 ───────
async function waitTx(txHash, onProgress) {
  return new Promise((resolve, reject) => {
    let ticks = 0;
    const check = setInterval(async () => {
      ticks++;
      try {
        const receipt = await ethRpc('eth_getTransactionReceipt', [txHash]);
        if (receipt) {
          clearInterval(check);
          if (receipt.status === '0x1' || receipt.status === true) resolve(receipt);
          else reject(new Error('交易失败 (status=0)'));
        } else if (onProgress) onProgress(ticks);
      } catch (e) { clearInterval(check); reject(e); }
    }, 3000);
    setTimeout(() => { clearInterval(check); reject(new Error('等待超时')); }, 300000);
  });
}

// ─────── Toast 通知 ───────
function showToast(msg, type = 'info', duration = 4000) {
  const colors = { info: '#3b82f6', success: '#22c55e', error: '#ef4444', warning: '#f59e0b' };
  const toast = document.createElement('div');
  toast.style.cssText = `position:fixed;top:24px;right:24px;z-index:99999;background:${colors[type]||colors.info};color:#fff;padding:12px 22px;border-radius:10px;font-size:14px;font-weight:600;box-shadow:0 8px 30px rgba(0,0,0,.35);max-width:420px;word-break:break-all`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

// ─────── 监听钱包事件 ───────
function listenWalletEvents(onAccountChange, onChainChange) {
  if (!window.ethereum) return;
  window.ethereum.on('accountsChanged', (accounts) => {
    if (accounts && accounts.length > 0) {
      userAccount = accounts[0];
      onAccountChange(accounts[0]);
    } else {
      userAccount = null;
      onAccountChange(null);
    }
  });
  window.ethereum.on('chainChanged', (chainId) => {
    currentChainId = parseInt(chainId, 16);
    onChainChange(currentChainId);
  });
}

// ─────── 兼容旧名 ───────
window.callContractView = contractCall;
window.sendContractTx = contractTx;
