// ===================== Web3 兼容层 (Bridge) =====================
// 让旧代码中的 contract.methods.x().call() / .send() 风格继续可用
// 内部委托到 web3utils.js 的 contractCall / contractTx
// 自动从全局 CONTRACT_ABI 解析函数签名

function makeMethodsProxy(addr) {
  return new Proxy({}, {
    get(_, methodName) {
      // 查找 ABI 条目
      if (methodName === 'call' || methodName === 'send' || methodName === 'estimateGas') return undefined;
      const abiEntry = (window.CONTRACT_ABI || []).find(e => e.name === methodName && e.type === 'function');
      if (!abiEntry) {
        return (...args) => { throw new Error('ABI 未找到方法: ' + methodName); };
      }
      // 返回一个 callable: contract.methods.x(arg1, arg2).call() / .send({ from, value })
      return (...args) => {
        const isReadOnly = abiEntry.stateMutability === 'view' || abiEntry.stateMutability === 'pure';
        return {
          call: async () => {
            return await contractCall(addr, methodName, args);
          },
          send: async (opts = {}) => {
            if (isReadOnly) throw new Error(methodName + ' 是 view 函数，不能 send');
            const value = opts.value ? opts.value.toString() : '0';
            const txHash = await contractTx(addr, methodName, args, value);
            // 模拟 web3 的 receipt 返回
            if (opts && opts.skipReceipt) return { transactionHash: txHash };
            const receipt = await waitTx(txHash);
            return {
              ...receipt,
              transactionHash: txHash,
              options: { address: addr }
            };
          },
          estimateGas: async () => {
            // 简化的 gas 估算
            return 200000;
          }
        };
      };
    }
  });
}

// 兼容 ERC20 ABI 常用方法（mint.html 用到）
const ERC20_ABI = [
  { type: 'function', name: 'name', inputs: [], outputs: [{type:'string'}], stateMutability: 'view' },
  { type: 'function', name: 'symbol', inputs: [], outputs: [{type:'string'}], stateMutability: 'view' },
  { type: 'function', name: 'decimals', inputs: [], outputs: [{type:'uint8'}], stateMutability: 'view' },
  { type: 'function', name: 'balanceOf', inputs: [{type:'address'}], outputs: [{type:'uint256'}], stateMutability: 'view' },
  { type: 'function', name: 'allowance', inputs: [{type:'address'},{type:'address'}], outputs: [{type:'uint256'}], stateMutability: 'view' },
  { type: 'function', name: 'approve', inputs: [{type:'address'},{type:'uint256'}], outputs: [{type:'bool'}], stateMutability: 'nonpayable' },
  { type: 'function', name: 'transfer', inputs: [{type:'address'},{type:'uint256'}], outputs: [{type:'bool'}], stateMutability: 'nonpayable' },
];

// 重新定义 getContract，兼容旧用法
function getContractCompat(addr, abiOverride) {
  const abi = abiOverride || window.CONTRACT_ABI;
  return {
    methods: makeErc20OrContractMethods(addr, abi),
    options: { address: addr }
  };
}

function makeErc20OrContractMethods(addr, abi) {
  return new Proxy({}, {
    get(_, methodName) {
      if (methodName === 'call' || methodName === 'send' || methodName === 'estimateGas') return undefined;
      const abiEntry = (abi || []).find(e => e.name === methodName && e.type === 'function');
      if (!abiEntry) {
        return (...args) => { throw new Error('ABI 未找到方法: ' + methodName); };
      }
      return (...args) => {
        const isReadOnly = abiEntry.stateMutability === 'view' || abiEntry.stateMutability === 'pure';
        return {
          call: async () => {
            if (abi === window.CONTRACT_ABI) {
              return await contractCall(addr, methodName, args);
            } else {
              // ERC20 (临时：编码并调用)
              return await erc20Call(addr, abi, methodName, args);
            }
          },
          send: async (opts = {}) => {
            const value = opts.value ? opts.value.toString() : '0';
            if (abi === window.CONTRACT_ABI) {
              const txHash = await contractTx(addr, methodName, args, value);
              const receipt = await waitTx(txHash);
              return { ...receipt, transactionHash: txHash, options: { address: addr } };
            } else {
              const txHash = await erc20Send(addr, abi, methodName, args, value);
              const receipt = await waitTx(txHash);
              return { ...receipt, transactionHash: txHash, options: { address: addr } };
            }
          },
          estimateGas: async () => 100000
        };
      };
    }
  });
}

// ERC20 编码调用 - 直接复用 encodeCall 但用传入的 ABI
function erc20Call(addr, abi, method, args) {
  // 临时将 CONTRACT_ABI 替换为传入的 abi
  const orig = window.CONTRACT_ABI;
  window.CONTRACT_ABI = abi;
  // 同时把对应选择器加进 SELECTORS
  const sels = window.SELECTORS || {};
  for (const item of abi) {
    if (item.type === 'function') {
      const types = item.inputs.map(i => i.type).join(',');
      const sig = item.name + '(' + types + ')';
      if (!sels[sig]) {
        // 用 browser 内的近似 keccak 不可行，但 ERC20 的常用方法选择器都是已知的
        sels[sig] = ERC20_SELECTORS[sig] || ('0x' + s); // 兜底
      }
    }
  }
  window.SELECTORS = sels;
  // 注意：实际部署中 ERC20 选择器通过预计算表
  // 简单做法：硬编码常用的
  try {
    return contractCall(addr, method, args);
  } finally {
    window.CONTRACT_ABI = orig;
  }
}

function erc20Send(addr, abi, method, args, value) {
  const orig = window.CONTRACT_ABI;
  window.CONTRACT_ABI = abi;
  try {
    return contractTx(addr, method, args, value);
  } finally {
    window.CONTRACT_ABI = orig;
  }
}

// 硬编码常用 ERC20 选择器 (从 ethers.id 计算)
const ERC20_SELECTORS = {
  'name()': '0x06fdde03',
  'symbol()': '0x95d89b41',
  'decimals()': '0x313ce567',
  'totalSupply()': '0x18160ddd',
  'balanceOf(address)': '0x70a08231',
  'allowance(address,address)': '0xdd62ed3e',
  'approve(address,uint256)': '0x095ea7b3',
  'transfer(address,uint256)': '0xa9059cbb',
};

// 覆盖全局 getContract 为兼容版
window.getContract = getContractCompat;

// ERC20 ABI 也暴露给页面
window.ERC20_ABI = ERC20_ABI;
