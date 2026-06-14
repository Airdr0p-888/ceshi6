// Script to update fairmint-dapp.html with new PRECOMPILED data and deploy logic
const fs = require('fs');

let html = fs.readFileSync('fairmint-dapp.html', 'utf8');

// ===== 1. Replace the PRECOMPILED block =====
// Find the old PRECOMPILED object (from "var PRECOMPILED = {" to the closing "};")
const precompiledStart = html.indexOf('var PRECOMPILED = {');
const precompiledEnd = html.indexOf('};', precompiledStart) + 2;

const snippet = fs.readFileSync('precompiled_snippet.js', 'utf8');
html = html.substring(0, precompiledStart) + snippet + html.substring(precompiledEnd);

console.log('Replaced PRECOMPILED block');

// ===== 2. Replace the oneClickDeploy function =====
const oldDeployStart = html.indexOf('async function oneClickDeploy()');
const oldDeployEnd = html.indexOf('\n}', html.indexOf('toast(\'部署失败\', \'error\');', oldDeployStart)) + 2;

const newDeploy = `async function oneClickDeploy() {
    if (!signer) { toast('请先连接钱包', 'error'); return; }

    // Compile if needed, or use precompiled data
    if (!compiledData) {
        // Try browser compile first
        try {
            await compileContracts();
        } catch (e) {
            // Ignore, will try precompiled below
        }

        // If still no compiled data, use precompiled
        if (!compiledData && typeof PRECOMPILED !== 'undefined' && PRECOMPILED.mainBytecode) {
            compiledData = {
                libBytecode: PRECOMPILED.libBytecode,
                libAbi: PRECOMPILED.libAbi,
                implBytecode: PRECOMPILED.implBytecode,
                implAbi: PRECOMPILED.implAbi,
                mainBytecode: PRECOMPILED.mainBytecode,
                mainAbi: PRECOMPILED.mainAbi,
                libPlaceholder: PRECOMPILED.libPlaceholder
            };
            toast('使用预编译字节码部署 (含 IterableMapping 库)', 'info');
        }

        if (!compiledData) { toast('编译失败且无预编译数据', 'error'); return; }
    }

    var btn = document.getElementById('btnOneClickDeploy');
    btn.disabled = true;

    var netKey = document.getElementById('deployNetwork').value;
    if (netKey !== 'custom') {
        await switchNetwork(netKey);
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
    }

    try {
        // Step 2: Deploy IterableMapping library
        setStepState(2, 'active');
        setStatus('deployStatus', '⏳ Step 1/3: 部署 IterableMapping 库合约，请在钱包确认...', 'pending');

        if (!compiledData.libBytecode) throw new Error('缺少 IterableMapping 库字节码');

        var libTx = await signer.sendTransaction({ data: compiledData.libBytecode });
        var libNetKey = netKey === 'custom' ? 'bsc-test' : netKey;
        setStatus('deployStatus', '⏳ IterableMapping 交易已提交，等待确认...<br>Tx: <a class="tx-link" href="' + txLink(libTx.hash, libNetKey) + '" target="_blank">' + libTx.hash + '</a>', 'pending');
        var libReceipt = await libTx.wait();
        var libAddr = libReceipt.contractAddress;

        if (!libAddr) throw new Error('IterableMapping 部署地址未获取');

        setStepState(2, 'done');
        toast('IterableMapping 库已部署: ' + shortAddr(libAddr), 'success');

        // Step 3: Link library into implBytecode and deploy DividendTracker
        setStepState(3, 'active');
        setStatus('deployStatus', '✅ IterableMapping: ' + shortAddr(libAddr) + '<br>⏳ Step 2/3: 部署 DividendTracker 实现合约，请在钱包确认...', 'pending');

        // Link the library address into the impl bytecode
        // The placeholder __$cddf767d9b66d83d1e181287a0f97ee897$__ (40 chars)
        // needs to be replaced with the 20-byte address (40 hex chars, no 0x, lowercase)
        var libAddrPadded = libAddr.toLowerCase().replace('0x', '');
        // Pad to 40 chars (should already be 40 for a normal address, but just in case)
        while (libAddrPadded.length < 40) { libAddrPadded = '0' + libAddrPadded; }

        var linkedImplBytecode = compiledData.implBytecode;
        if (compiledData.libPlaceholder) {
            linkedImplBytecode = linkedImplBytecode.split(compiledData.libPlaceholder).join(libAddrPadded);
        } else {
            // Fallback: try the known placeholder pattern
            var placeholderPattern = /__\\$[0-9a-f]+\\$__/g;
            linkedImplBytecode = linkedImplBytecode.replace(placeholderPattern, libAddrPadded);
        }

        // Verify no more placeholders remain
        if (/_\\$/.test(linkedImplBytecode)) {
            throw new Error('implBytecode 仍有未链接的库占位符');
        }

        var implTx = await signer.sendTransaction({ data: linkedImplBytecode });
        setStatus('deployStatus', '✅ IterableMapping: ' + shortAddr(libAddr) + '<br>⏳ DividendTracker 交易已提交，等待确认...<br>Tx: <a class="tx-link" href="' + txLink(implTx.hash, libNetKey) + '" target="_blank">' + implTx.hash + '</a>', 'pending');
        var implReceipt = await implTx.wait();
        var implAddr = implReceipt.contractAddress;

        if (!implAddr) throw new Error('DividendTracker 部署地址未获取');

        setStepState(3, 'done');
        toast('DividendTracker 已部署: ' + shortAddr(implAddr), 'success');

        // Step 4: Deploy BananaToken main contract
        setStepState(4, 'active');
        setStatus('deployStatus', '✅ IterableMapping: ' + shortAddr(libAddr) + '<br>✅ DividendTracker: ' + shortAddr(implAddr) + '<br>⏳ Step 3/3: 部署 BananaToken 主合约，请在钱包确认...', 'pending');

        // Gather constructor params
        var name = document.getElementById('d_name').value || 'Banana Token';
        var symbol = document.getElementById('d_symbol').value || 'BANANA';
        var totalSupply = document.getElementById('d_totalSupply').value || '1000000000';
        var buyFundFee = Number(document.getElementById('d_buyFundFee').value) || 0;
        var buyLpFee = Number(document.getElementById('d_buyLpFee').value) || 0;
        var buyRewardFee = Number(document.getElementById('d_buyRewardFee').value) || 0;
        var buyBurnFee = Number(document.getElementById('d_buyBurnFee').value) || 0;
        var sellFundFee = Number(document.getElementById('d_sellFundFee').value) || 0;
        var sellLpFee = Number(document.getElementById('d_sellLpFee').value) || 0;
        var sellRewardFee = Number(document.getElementById('d_sellRewardFee').value) || 0;
        var sellBurnFee = Number(document.getElementById('d_sellBurnFee').value) || 0;
        var maxBuy = Number(document.getElementById('d_maxBuy').value) || 0;
        var maxSell = Number(document.getElementById('d_maxSell').value) || 0;
        var maxWallet = Number(document.getElementById('d_maxWallet').value) || 0;
        var secondTime = Number(document.getElementById('d_secondTime').value) || 0;
        var kb = Number(document.getElementById('d_kb').value) || 0;
        var airdropNumbs = Number(document.getElementById('d_airdropNumbs').value) || 0;
        var inviType = Number(document.getElementById('d_inviType').value) || 0;
        var transferFee = Number(document.getElementById('d_transferFee').value) || 0;
        var mushHoldNum = Number(document.getElementById('d_mushHoldNum').value) || 0;
        var bindAmount = Number(document.getElementById('d_bindAmount').value) || 0;

        var currency = document.getElementById('d_currency').value.trim();
        var router = document.getElementById('d_router').value.trim();
        var fundAddr = document.getElementById('d_fundAddr').value.trim() || currentAccount;
        var rewardToken = document.getElementById('d_rewardToken').value.trim() || currency;
        var receiveAddr = document.getElementById('d_receiveAddr').value.trim() || currentAccount;
        var owner = document.getElementById('d_owner').value.trim() || currentAccount;

        var currencyIsEth = document.getElementById('d_currencyIsEth').value === 'true';
        var enableOffTrade = document.getElementById('d_enableOffTrade').value === 'true';

        var invitersStr = document.getElementById('d_inviters').value.trim();
        var inviters = [];
        if (invitersStr) {
            inviters = invitersStr.split(',').map(function(s) { return Number(s.trim()); }).filter(function(n) { return !isNaN(n); });
        }

        var stringParams = [name, symbol];
        var addressParams = [currency, router, fundAddr, rewardToken, implAddr, receiveAddr, owner];
        var numberParams = [
            parseNum(totalSupply),
            buyFundFee, buyLpFee, buyRewardFee, buyBurnFee,
            sellFundFee, sellLpFee, sellRewardFee, sellBurnFee,
            parseNum(maxBuy.toString()),
            parseNum(maxSell.toString()),
            parseNum(maxWallet.toString()),
            secondTime, kb, airdropNumbs, inviType, transferFee, mushHoldNum, bindAmount
        ];
        var boolParams = [currencyIsEth, enableOffTrade];

        // Encode constructor args
        var abiCoder = new ethers.utils.AbiCoder();
        var constructorArgs = abiCoder.encode(
            ['string[]', 'address[]', 'uint256[]', 'bool[]', 'uint256[]'],
            [stringParams, addressParams, numberParams, boolParams, inviters]
        );

        var fullData = compiledData.mainBytecode + constructorArgs.slice(2);

        var mainTx = await signer.sendTransaction({ data: fullData });
        setStatus('deployStatus', '✅ IterableMapping: ' + shortAddr(libAddr) + '<br>✅ DividendTracker: ' + shortAddr(implAddr) + '<br>⏳ BananaToken 交易已提交，等待确认...<br>Tx: <a class="tx-link" href="' + txLink(mainTx.hash, libNetKey) + '" target="_blank">' + mainTx.hash + '</a>', 'pending');
        var mainReceipt = await mainTx.wait();
        var mainAddr = mainReceipt.contractAddress;

        if (!mainAddr) throw new Error('BananaToken 部署地址未获取');

        setStepState(4, 'done');
        setStepState(5, 'done');

        setStatus('deployStatus', '✅ 全部部署完成! Gas: ' + mainReceipt.gasUsed.toString(), 'success');
        document.getElementById('deployedCard').style.display = 'block';
        document.getElementById('deployedImpl').textContent = implAddr;
        document.getElementById('deployedAddr').textContent = mainAddr;
        document.getElementById('deployedTx').innerHTML = '<a class="tx-link" href="' + txLink(mainTx.hash, libNetKey) + '" target="_blank">' + mainTx.hash + '</a>';

        // Save deployment info
        window._deployInfo = {
            libAddr: libAddr,
            implAddr: implAddr,
            mainAddr: mainAddr,
            mainTx: mainTx.hash,
            network: libNetKey
        };

        toast('部署成功! 合约地址: ' + shortAddr(mainAddr), 'success');

    } catch (e) {
        toast('部署失败: ' + e.message, 'error');
        console.error('Deploy error:', e);
    } finally {
        btn.disabled = false;
    }
}`;

html = html.substring(0, oldDeployStart) + newDeploy + html.substring(oldDeployEnd);
console.log('Replaced oneClickDeploy function');

// ===== 3. Update the deploy steps UI to include IterableMapping step =====
// Find the deploy steps section and update it
var oldSteps = `                <div class="deploy-step" id="step1">
                    <span class="step-num">1</span> 连接钱包
                </div>
                <div class="deploy-step" id="step2">
                    <span class="step-num">2</span> 编译合约
                </div>
                <div class="deploy-step" id="step3">
                    <span class="step-num">3</span> 部署 DividendTracker
                </div>
                <div class="deploy-step" id="step4">
                    <span class="step-num">4</span> 部署 BananaToken
                </div>
                <div class="deploy-step" id="step5">
                    <span class="step-num">5</span> 完成
                </div>`;

var newSteps = `                <div class="deploy-step" id="step1">
                    <span class="step-num">1</span> 连接钱包
                </div>
                <div class="deploy-step" id="step2">
                    <span class="step-num">2</span> 部署 IterableMapping 库
                </div>
                <div class="deploy-step" id="step3">
                    <span class="step-num">3</span> 部署 DividendTracker
                </div>
                <div class="deploy-step" id="step4">
                    <span class="step-num">4</span> 部署 BananaToken
                </div>
                <div class="deploy-step" id="step5">
                    <span class="step-num">5</span> 完成
                </div>`;

html = html.replace(oldSteps, newSteps);
console.log('Updated deploy steps UI');

// ===== 4. Update usePrecompiled function =====
var oldUsePrecompiled = `    if (typeof PRECOMPILED !== 'undefined' && PRECOMPILED.mainBytecode) {
        compiledData = {
            mainBytecode: PRECOMPILED.mainBytecode,
            implBytecode: PRECOMPILED.implBytecode,
            mainAbi: JSON.stringify(BANANA_ABI, null, 2),
            implAbi: '[]'
        };
        toast('已加载预编译字节码', 'success');

        var mainSize = (PRECOMPILED.mainBytecode.length / 2).toLocaleString();
        var implSize = (PRECOMPILED.implBytecode.length / 2).toLocaleString();`;

var newUsePrecompiled = `    if (typeof PRECOMPILED !== 'undefined' && PRECOMPILED.mainBytecode) {
        compiledData = {
            libBytecode: PRECOMPILED.libBytecode,
            libAbi: PRECOMPILED.libAbi,
            implBytecode: PRECOMPILED.implBytecode,
            implAbi: PRECOMPILED.implAbi,
            mainBytecode: PRECOMPILED.mainBytecode,
            mainAbi: PRECOMPILED.mainAbi,
            libPlaceholder: PRECOMPILED.libPlaceholder
        };
        toast('已加载预编译字节码 (含 IterableMapping 库)', 'success');

        var mainSize = ((PRECOMPILED.mainBytecode.length - 2) / 2).toLocaleString();
        var implSize = ((PRECOMPILED.implBytecode.length - 2) / 2).toLocaleString();
        var libSize = ((PRECOMPILED.libBytecode.length - 2) / 2).toLocaleString();`;

html = html.replace(oldUsePrecompiled, newUsePrecompiled);
console.log('Updated usePrecompiled function');

// Also update the bytecode size display section if it references implBytecodeSize
var oldSizeDisplay = `        document.getElementById('mainBytecodeSize').textContent = mainSize + ' bytes';
        document.getElementById('implBytecodeSize').textContent = implSize + ' bytes';`;

// Check if there are stats elements for lib
var sizeDisplayMatch = html.indexOf('mainBytecodeSize');
if (sizeDisplayMatch > -1) {
    // We need to update size displays - there might be multiple instances
    // Let's just update them all
    html = html.replace(
        /document\.getElementById\('implBytecodeSize'\)\.textContent = implSize \+ ' bytes';/g,
        "document.getElementById('implBytecodeSize').textContent = implSize + ' bytes';\n            document.getElementById('libBytecodeSize').textContent = libSize + ' bytes';"
    );
}

// ===== 5. Also update the fallback in oneClickDeploy where PRECOMPILED is used =====
// This is already handled in the new oneClickDeploy function above

// Write the updated HTML
fs.writeFileSync('fairmint-dapp.html', html);
console.log('Written updated fairmint-dapp.html');
