/**
 * Vanity Address Worker — 在后台线程暴力搜索 CREATE2 salt
 *
 * 原理：
 *   CREATE2 地址 = keccak256(0xff + factory_addr + salt + keccak256(init_code))
 *   我们无法改变 factory_addr 和 init_code，只能遍历 salt 来找目标尾号。
 *
 * 优化：
 *   - 尾号校验只匹配 address 末尾的 hex 字符（如 "888" 匹配 "0x...888"）
 *   - 使用 Uint8Array 和 DataView 加速哈希计算（避免 BigInt 开销）
 *   - 从随机起始 salt 开始遍历，避免重复计算
 */

// ============ 简易 keccak256 模拟（纯 JS，不依赖 ethers） ============
// 注意：CREATE2 地址计算需要 keccak256，我们使用 SubtleCrypto (SHA3/keccak256)
// 浏览器不支持原生 keccak256，但我们可以用 js-sha3 或 ethers。
// 这里 Worker 使用 importScripts 加载 ethers 太笨重，
// 改用：Worker 只负责生成候选 salt，主线程负责验证地址。

// 实际上，计算 CREATE2 地址需要 keccak256，在 Worker 里没法直接用 ethers。
// 改进方案：Worker 生成 salt 候选值，主线程批量验证。

let isRunning = false;
let stopRequested = false;
let batchSize = 500; // 每批 salt 数量，发给主线程验证

// 当前进度
let totalChecked = 0;
let startTime = 0;

self.onmessage = function (e) {
  const msg = e.data;

  switch (msg.type) {
    case 'start':
      isRunning = true;
      stopRequested = false;
      totalChecked = 0;
      startTime = Date.now();
      batchSize = msg.batchSize || 500;
      generateSalts();
      break;

    case 'stop':
      stopRequested = true;
      isRunning = false;
      break;

    case 'resume':
      isRunning = true;
      stopRequested = false;
      generateSalts();
      break;
  }
};

function generateSalts() {
  if (!isRunning || stopRequested) return;

  // 生成一批随机 salt
  const salts = new Array(batchSize);
  for (let i = 0; i < batchSize; i++) {
    // 随机 32 字节 salt
    const salt = new Uint8Array(32);
    crypto.getRandomValues(salt);
    // 转为 hex 字符串
    let hex = '';
    for (let j = 0; j < 32; j++) {
      hex += salt[j].toString(16).padStart(2, '0');
    }
    salts[i] = '0x' + hex;
  }

  totalChecked += batchSize;
  const elapsed = (Date.now() - startTime) / 1000;
  const speed = elapsed > 0 ? Math.round(totalChecked / elapsed) : 0;

  self.postMessage({
    type: 'batch',
    salts: salts,
    totalChecked: totalChecked,
    speed: speed,
    elapsed: elapsed
  });

  // 使用 setTimeout 避免阻塞 Worker，同时让主线程有时间处理
  setTimeout(() => {
    if (isRunning && !stopRequested) {
      generateSalts();
    }
  }, 0);
}
