// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() {
        _transferOwnership(_msgSender());
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    modifier onlyOwner() {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

abstract contract Initializable {
    bool private _initialized;
    bool private _initializing;

    modifier initializer() {
        require(_initializing || !_initialized, "Initializable: contract is already initialized");
        bool isTopLevelCall = !_initializing;
        if (isTopLevelCall) {
            _initializing = true;
            _initialized = true;
        }
        _;
        if (isTopLevelCall) {
            _initializing = false;
        }
    }
}

abstract contract ContextUpgradeable is Initializable {
    function __Context_init() internal initializer {
        __Context_init_unchained();
    }

    function __Context_init_unchained() internal initializer {
    }

    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    uint256[50] private __gap;
}

abstract contract OwnableUpgradeable is Initializable, ContextUpgradeable {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    function __Ownable_init() internal initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
    }

    function __Ownable_init_unchained() internal initializer {
        _setOwner(_msgSender());
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    modifier onlyOwner() {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    function renounceOwnership() public virtual onlyOwner {
        _setOwner(address(0));
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _setOwner(newOwner);
    }

    function _setOwner(address newOwner) private {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    uint256[49] private __gap;
}

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

interface IERC20Metadata is IERC20 {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
}

library SafeMath {
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");
        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return sub(a, b, "SafeMath: subtraction overflow");
    }

    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        uint256 c = a - b;
        return c;
    }

    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }
        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");
        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return div(a, b, "SafeMath: division by zero");
    }

    function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b > 0, errorMessage);
        uint256 c = a / b;
        return c;
    }

    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        return mod(a, b, "SafeMath: modulo by zero");
    }

    function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b != 0, errorMessage);
        return a % b;
    }
}

library SafeMathInt {
    int256 private constant MIN_INT256 = int256(1) << 255;
    int256 private constant MAX_INT256 = ~(int256(1) << 255);

    function mul(int256 a, int256 b) internal pure returns (int256) {
        int256 c = a * b;
        require(c != MIN_INT256 || (a & MIN_INT256) != (b & MIN_INT256));
        require((b == 0) || (c / b == a));
        return c;
    }

    function div(int256 a, int256 b) internal pure returns (int256) {
        require(b != -1 || a != MIN_INT256);
        return a / b;
    }

    function sub(int256 a, int256 b) internal pure returns (int256) {
        int256 c = a - b;
        require((b >= 0 && c <= a) || (b < 0 && c > a));
        return c;
    }

    function add(int256 a, int256 b) internal pure returns (int256) {
        int256 c = a + b;
        require((b >= 0 && c >= a) || (b < 0 && c < a));
        return c;
    }

    function abs(int256 a) internal pure returns (int256) {
        require(a != MIN_INT256);
        return a < 0 ? -a : a;
    }

    function toUint256Safe(int256 a) internal pure returns (uint256) {
        require(a >= 0);
        return uint256(a);
    }
}

library SafeMathUint {
    function toInt256Safe(uint256 a) internal pure returns (int256) {
        int256 b = int256(a);
        require(b >= 0);
        return b;
    }
}

library Clones {
    function clone(address implementation) internal returns (address instance) {
        assembly {
            let ptr := mload(0x40)
            mstore(ptr, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
            mstore(add(ptr, 0x14), shl(0x60, implementation))
            mstore(add(ptr, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
            instance := create(0, ptr, 0x37)
        }
        require(instance != address(0), "ERC1167: create failed");
    }

    function cloneDeterministic(address implementation, bytes32 salt) internal returns (address instance) {
        assembly {
            let ptr := mload(0x40)
            mstore(ptr, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
            mstore(add(ptr, 0x14), shl(0x60, implementation))
            mstore(add(ptr, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
            instance := create2(0, ptr, 0x37, salt)
        }
        require(instance != address(0), "ERC1167: create2 failed");
    }

    function predictDeterministicAddress(address implementation, bytes32 salt, address deployer) internal pure returns (address predicted) {
        assembly {
            let ptr := mload(0x40)
            mstore(ptr, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
            mstore(add(ptr, 0x14), shl(0x60, implementation))
            mstore(add(ptr, 0x28), 0x5af43d82803e903d91602b57fd5bf3ff00000000000000000000000000000000)
            mstore(add(ptr, 0x38), shl(0x60, deployer))
            mstore(add(ptr, 0x4c), salt)
            mstore(add(ptr, 0x6c), keccak256(ptr, 0x37))
            predicted := keccak256(add(ptr, 0x37), 0x55)
        }
    }

    function predictDeterministicAddress(address implementation, bytes32 salt) internal view returns (address predicted) {
        return predictDeterministicAddress(implementation, salt, address(this));
    }
}

contract ERC20 is Context, IERC20, IERC20Metadata {
    using SafeMath for uint256;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    uint256 private _totalSupply;
    string _name;
    string _symbol;

    constructor() {}

    function name() public view virtual override returns (string memory) {
        return _name;
    }

    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    function decimals() public view virtual override returns (uint8) {
        return 18;
    }

    function totalSupply() public view virtual override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view virtual override returns (uint256) {
        return _balances[account];
    }

    function transfer(address recipient, uint256 amount) public virtual override returns (bool) {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    function allowance(address owner, address spender) public view virtual override returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) public virtual override returns (bool) {
        _transfer(sender, recipient, amount);
        _approve(sender, _msgSender(), _allowances[sender][_msgSender()].sub(amount, "ERC20: transfer amount exceeds allowance"));
        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        _approve(_msgSender(), spender, _allowances[_msgSender()][spender].add(addedValue));
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        _approve(_msgSender(), spender, _allowances[_msgSender()][spender].sub(subtractedValue, "ERC20: decreased allowance below zero"));
        return true;
    }

    function _transfer(address sender, address recipient, uint256 amount) internal virtual {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");
        _beforeTokenTransfer(sender, recipient, amount);
        _balances[sender] = _balances[sender].sub(amount, "ERC20: transfer amount exceeds balance");
        _balances[recipient] = _balances[recipient].add(amount);
        emit Transfer(sender, recipient, amount);
    }

    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: mint to the zero address");
        _beforeTokenTransfer(address(0), account, amount);
        _totalSupply = _totalSupply.add(amount);
        _balances[account] = _balances[account].add(amount);
        emit Transfer(address(0), account, amount);
    }

    function _burn(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: burn from the zero address");
        _beforeTokenTransfer(account, address(0), amount);
        _balances[account] = _balances[account].sub(amount, "ERC20: burn amount exceeds balance");
        _totalSupply = _totalSupply.sub(amount);
        emit Transfer(account, address(0), amount);
    }

    function _approve(address owner, address spender, uint256 amount) internal virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");
        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual {}
}

interface IUniswapV2Router01 {
    function factory() external pure returns (address);
    function WETH() external pure returns (address);
    function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB, uint liquidity);
    function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external payable returns (uint amountToken, uint amountETH, uint liquidity);
    function removeLiquidity(address tokenA, address tokenB, uint liquidity, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB);
    function removeLiquidityETH(address token, uint liquidity, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external returns (uint amountToken, uint amountETH);
    function removeLiquidityWithPermit(address tokenA, address tokenB, uint liquidity, uint amountAMin, uint amountBMin, address to, uint deadline, bool approveMax, uint8 v, bytes32 r, bytes32 s) external returns (uint amountA, uint amountB);
    function removeLiquidityETHWithPermit(address token, uint liquidity, uint amountTokenMin, uint amountETHMin, address to, uint deadline, bool approveMax, uint8 v, bytes32 r, bytes32 s) external returns (uint amountToken, uint amountETH);
    function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts);
    function swapTokensForExactTokens(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts);
    function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts);
    function swapTokensForExactETH(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts);
    function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts);
    function swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts);
    function quote(uint amountA, uint reserveA, uint reserveB) external pure returns (uint amountB);
    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) external pure returns (uint amountOut);
    function getAmountIn(uint amountOut, uint reserveIn, uint reserveOut) external pure returns (uint amountIn);
    function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts);
    function getAmountsIn(uint amountOut, address[] calldata path) external view returns (uint[] memory amounts);
}

interface IUniswapV2Router02 is IUniswapV2Router01 {
    function removeLiquidityETHSupportingFeeOnTransferTokens(address token, uint liquidity, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external returns (uint amountETH);
    function removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(address token, uint liquidity, uint amountTokenMin, uint amountETHMin, address to, uint deadline, bool approveMax, uint8 v, bytes32 r, bytes32 s) external returns (uint amountETH);
    function swapExactTokensForTokensSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external;
    function swapExactETHForTokensSupportingFeeOnTransferTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable;
    function swapExactTokensForETHSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external;
}

interface IUniswapV2Factory {
    event PairCreated(address indexed token0, address indexed token1, address pair, uint);
    function feeTo() external view returns (address);
    function feeToSetter() external view returns (address);
    function getPair(address tokenA, address tokenB) external view returns (address pair);
    function allPairs(uint) external view returns (address pair);
    function allPairsLength() external view returns (uint);
    function createPair(address tokenA, address tokenB) external returns (address pair);
    function setFeeTo(address) external;
    function setFeeToSetter(address) external;
}

interface IUniswapV2Pair {
    event Approval(address indexed owner, address indexed spender, uint value);
    event Transfer(address indexed from, address indexed to, uint value);
    function name() external pure returns (string memory);
    function symbol() external pure returns (string memory);
    function decimals() external pure returns (uint8);
    function totalSupply() external view returns (uint);
    function balanceOf(address owner) external view returns (uint);
    function allowance(address owner, address spender) external view returns (uint);
    function approve(address spender, uint value) external returns (bool);
    function transfer(address to, uint value) external returns (bool);
    function transferFrom(address from, address to, uint value) external returns (bool);
    function DOMAIN_SEPARATOR() external view returns (bytes32);
    function PERMIT_TYPEHASH() external pure returns (bytes32);
    function nonces(address owner) external view returns (uint);
    function permit(address owner, address spender, uint value, uint deadline, uint8 v, bytes32 r, bytes32 s) external;
    event Mint(address indexed sender, uint amount0, uint amount1);
    event Burn(address indexed sender, uint amount0, uint amount1, address indexed to);
    event Swap(address indexed sender, uint amount0In, uint amount1In, uint amount0Out, uint amount1Out, address indexed to);
    event Sync(uint112 reserve0, uint112 reserve1);
    function MINIMUM_LIQUIDITY() external pure returns (uint);
    function factory() external view returns (address);
    function token0() external view returns (address);
    function token1() external view returns (address);
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
    function price0CumulativeLast() external view returns (uint);
    function price1CumulativeLast() external view returns (uint);
    function kLast() external view returns (uint);
    function mint(address to) external returns (uint liquidity);
    function burn(address to) external returns (uint amount0, uint amount1);
    function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external;
    function skim(address to) external;
    function sync() external;
    function initialize(address, address) external;
}

library IterableMapping {
    struct Map {
        address[] keys;
        mapping(address => uint256) values;
        mapping(address => uint256) indexOf;
        mapping(address => bool) inserted;
    }

    function get(Map storage map, address key) public view returns (uint256) {
        return map.values[key];
    }

    function getIndexOfKey(Map storage map, address key) public view returns (int256) {
        if (!map.inserted[key]) {
            return -1;
        }
        return int256(map.indexOf[key]);
    }

    function getKeyAtIndex(Map storage map, uint256 index) public view returns (address) {
        return map.keys[index];
    }

    function size(Map storage map) public view returns (uint256) {
        return map.keys.length;
    }

    function set(Map storage map, address key, uint256 val) public {
        if (map.inserted[key]) {
            map.values[key] = val;
        } else {
            map.inserted[key] = true;
            map.values[key] = val;
            map.indexOf[key] = map.keys.length;
            map.keys.push(key);
        }
    }

    function remove(Map storage map, address key) public {
        if (!map.inserted[key]) {
            return;
        }
        delete map.inserted[key];
        delete map.values[key];
        uint256 index = map.indexOf[key];
        uint256 lastIndex = map.keys.length - 1;
        address lastKey = map.keys[lastIndex];
        map.indexOf[lastKey] = index;
        delete map.indexOf[key];
        map.keys[index] = lastKey;
        map.keys.pop();
    }
}

interface DividendPayingTokenInterface {
    function dividendOf(address _owner) external view returns (uint256);
    function withdrawDividend() external;
    event DividendsDistributed(address indexed from, uint256 weiAmount);
    event DividendWithdrawn(address indexed to, uint256 weiAmount);
}

interface DividendPayingTokenOptionalInterface {
    function withdrawableDividendOf(address _owner) external view returns (uint256);
    function withdrawnDividendOf(address _owner) external view returns (uint256);
    function accumulativeDividendOf(address _owner) external view returns (uint256);
}

interface IERC20Upgradeable {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

interface IERC20MetadataUpgradeable is IERC20Upgradeable {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
}

contract ERC20Upgradeable is Initializable, ContextUpgradeable, IERC20Upgradeable, IERC20MetadataUpgradeable {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    uint256 private _totalSupply;
    string private _name;
    string private _symbol;

    function __ERC20_init(string memory name_, string memory symbol_) internal initializer {
        __Context_init_unchained();
        __ERC20_init_unchained(name_, symbol_);
    }

    function __ERC20_init_unchained(string memory name_, string memory symbol_) internal initializer {
        _name = name_;
        _symbol = symbol_;
    }

    function name() public view virtual override returns (string memory) {
        return _name;
    }

    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    function decimals() public view virtual override returns (uint8) {
        return 18;
    }

    function totalSupply() public view virtual override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view virtual override returns (uint256) {
        return _balances[account];
    }

    function transfer(address recipient, uint256 amount) public virtual override returns (bool) {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    function allowance(address owner, address spender) public view virtual override returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) public virtual override returns (bool) {
        _transfer(sender, recipient, amount);
        uint256 currentAllowance = _allowances[sender][_msgSender()];
        require(currentAllowance >= amount, "ERC20: transfer amount exceeds allowance");
        unchecked {
            _approve(sender, _msgSender(), currentAllowance - amount);
        }
        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        _approve(_msgSender(), spender, _allowances[_msgSender()][spender] + addedValue);
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        uint256 currentAllowance = _allowances[_msgSender()][spender];
        require(currentAllowance >= subtractedValue, "ERC20: decreased allowance below zero");
        unchecked {
            _approve(_msgSender(), spender, currentAllowance - subtractedValue);
        }
        return true;
    }

    function _transfer(address sender, address recipient, uint256 amount) internal virtual {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");
        _beforeTokenTransfer(sender, recipient, amount);
        uint256 senderBalance = _balances[sender];
        require(senderBalance >= amount, "ERC20: transfer amount exceeds balance");
        unchecked {
            _balances[sender] = senderBalance - amount;
        }
        _balances[recipient] += amount;
        emit Transfer(sender, recipient, amount);
        _afterTokenTransfer(sender, recipient, amount);
    }

    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: mint to the zero address");
        _beforeTokenTransfer(address(0), account, amount);
        _totalSupply += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount);
        _afterTokenTransfer(address(0), account, amount);
    }

    function _burn(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: burn from the zero address");
        _beforeTokenTransfer(account, address(0), amount);
        uint256 accountBalance = _balances[account];
        require(accountBalance >= amount, "ERC20: burn amount exceeds balance");
        unchecked {
            _balances[account] = accountBalance - amount;
        }
        _totalSupply -= amount;
        emit Transfer(account, address(0), amount);
        _afterTokenTransfer(account, address(0), amount);
    }

    function _approve(address owner, address spender, uint256 amount) internal virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");
        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual {}
    function _afterTokenTransfer(address from, address to, uint256 amount) internal virtual {}

    uint256[45] private __gap;
}

contract DividendPayingToken is ERC20Upgradeable, OwnableUpgradeable, DividendPayingTokenInterface, DividendPayingTokenOptionalInterface {
    using SafeMath for uint256;
    using SafeMathUint for uint256;
    using SafeMathInt for int256;

    address public rewardToken;
    uint256 internal constant magnitude = 2**128;
    uint256 internal magnifiedDividendPerShare;
    mapping(address => int256) internal magnifiedDividendCorrections;
    mapping(address => uint256) internal withdrawnDividends;
    uint256 public totalDividendsDistributed;

    function __DividendPayingToken_init(address _rewardToken, string memory _name, string memory _symbol) internal initializer {
        __Ownable_init();
        __ERC20_init(_name, _symbol);
        rewardToken = _rewardToken;
    }

    function distributeCAKEDividends(uint256 amount) public onlyOwner {
        require(totalSupply() > 0);
        if (amount > 0) {
            magnifiedDividendPerShare = magnifiedDividendPerShare.add((amount).mul(magnitude) / totalSupply());
            emit DividendsDistributed(msg.sender, amount);
            totalDividendsDistributed = totalDividendsDistributed.add(amount);
        }
    }

    function withdrawDividend() public virtual override {
        _withdrawDividendOfUser(payable(msg.sender));
    }

    function _withdrawDividendOfUser(address payable user) internal returns (uint256) {
        uint256 _withdrawableDividend = withdrawableDividendOf(user);
        if (_withdrawableDividend > 0) {
            withdrawnDividends[user] = withdrawnDividends[user].add(_withdrawableDividend);
            emit DividendWithdrawn(user, _withdrawableDividend);
            bool success = IERC20(rewardToken).transfer(user, _withdrawableDividend);
            if (!success) {
                withdrawnDividends[user] = withdrawnDividends[user].sub(_withdrawableDividend);
                return 0;
            }
            return _withdrawableDividend;
        }
        return 0;
    }

    function dividendOf(address _owner) public view override returns (uint256) {
        return withdrawableDividendOf(_owner);
    }

    function withdrawableDividendOf(address _owner) public view override returns (uint256) {
        return accumulativeDividendOf(_owner).sub(withdrawnDividends[_owner]);
    }

    function withdrawnDividendOf(address _owner) public view override returns (uint256) {
        return withdrawnDividends[_owner];
    }

    function accumulativeDividendOf(address _owner) public view override returns (uint256) {
        return magnifiedDividendPerShare.mul(balanceOf(_owner)).toInt256Safe().add(magnifiedDividendCorrections[_owner]).toUint256Safe() / magnitude;
    }

    function _transfer(address from, address to, uint256 value) internal virtual override {
        require(false);
        int256 _magCorrection = magnifiedDividendPerShare.mul(value).toInt256Safe();
        magnifiedDividendCorrections[from] = magnifiedDividendCorrections[from].add(_magCorrection);
        magnifiedDividendCorrections[to] = magnifiedDividendCorrections[to].sub(_magCorrection);
    }

    function _mint(address account, uint256 value) internal override {
        super._mint(account, value);
        magnifiedDividendCorrections[account] = magnifiedDividendCorrections[account].sub((magnifiedDividendPerShare.mul(value)).toInt256Safe());
    }

    function _burn(address account, uint256 value) internal override {
        super._burn(account, value);
        magnifiedDividendCorrections[account] = magnifiedDividendCorrections[account].add((magnifiedDividendPerShare.mul(value)).toInt256Safe());
    }

    function _setBalance(address account, uint256 newBalance) internal {
        uint256 currentBalance = balanceOf(account);
        if (newBalance > currentBalance) {
            uint256 mintAmount = newBalance.sub(currentBalance);
            _mint(account, mintAmount);
        } else if (newBalance < currentBalance) {
            uint256 burnAmount = currentBalance.sub(newBalance);
            _burn(account, burnAmount);
        }
    }
}

contract BABYTOKENDividendTracker is OwnableUpgradeable, DividendPayingToken {
    using SafeMath for uint256;
    using SafeMathInt for int256;
    using IterableMapping for IterableMapping.Map;

    IterableMapping.Map private tokenHoldersMap;
    uint256 public lastProcessedIndex;
    mapping(address => bool) public excludedFromDividends;
    mapping(address => uint256) public lastClaimTimes;
    uint256 public claimWait;
    uint256 public minimumTokenBalanceForDividends;

    event ExcludeFromDividends(address indexed account);
    event ClaimWaitUpdated(uint256 indexed newValue, uint256 indexed oldValue);
    event Claim(address indexed account, uint256 amount, bool indexed automatic);

    function initialize(address rewardToken_, uint256 minimumTokenBalanceForDividends_) external initializer {
        DividendPayingToken.__DividendPayingToken_init(rewardToken_, "DIVIDEND_TRACKER", "DIVIDEND_TRACKER");
        claimWait = 3600;
        minimumTokenBalanceForDividends = minimumTokenBalanceForDividends_;
    }

    function _transfer(address, address, uint256) internal pure override {
        require(false, "Dividend_Tracker: No transfers allowed");
    }

    function withdrawDividend() public pure override {
        require(false, "Dividend_Tracker: withdrawDividend disabled. Use the 'claim' function on the main contract.");
    }

    function excludeFromDividends(address account) external onlyOwner {
        require(!excludedFromDividends[account]);
        excludedFromDividends[account] = true;
        _setBalance(account, 0);
        tokenHoldersMap.remove(account);
        emit ExcludeFromDividends(account);
    }

    function isExcludedFromDividends(address account) public view returns (bool) {
        return excludedFromDividends[account];
    }

    function updateClaimWait(uint256 newClaimWait) external onlyOwner {
        require(newClaimWait >= 3600 && newClaimWait <= 86400, "Dividend_Tracker: claimWait must be updated to between 1 and 24 hours");
        require(newClaimWait != claimWait, "Dividend_Tracker: Cannot update claimWait to same value");
        emit ClaimWaitUpdated(newClaimWait, claimWait);
        claimWait = newClaimWait;
    }

    function updateMinimumTokenBalanceForDividends(uint256 amount) external onlyOwner {
        minimumTokenBalanceForDividends = amount;
    }

    function getLastProcessedIndex() external view returns (uint256) {
        return lastProcessedIndex;
    }

    function getNumberOfTokenHolders() external view returns (uint256) {
        return tokenHoldersMap.keys.length;
    }

    function getAccount(address _account) public view returns (address, int256, int256, uint256, uint256, uint256, uint256, uint256) {
        address account = _account;
        int256 index = tokenHoldersMap.getIndexOfKey(account);
        int256 iterationsUntilProcessed = -1;
        if (index >= 0) {
            if (uint256(index) > lastProcessedIndex) {
                iterationsUntilProcessed = index.sub(int256(lastProcessedIndex));
            } else {
                uint256 processesUntilEndOfArray = tokenHoldersMap.keys.length > lastProcessedIndex ? tokenHoldersMap.keys.length.sub(lastProcessedIndex) : 0;
                iterationsUntilProcessed = index.add(int256(processesUntilEndOfArray));
            }
        }
        uint256 withdrawableDividends = withdrawableDividendOf(account);
        uint256 totalDividends = accumulativeDividendOf(account);
        uint256 lastClaimTime = lastClaimTimes[account];
        uint256 nextClaimTime = lastClaimTime > 0 ? lastClaimTime.add(claimWait) : 0;
        uint256 secondsUntilAutoClaimAvailable = nextClaimTime > block.timestamp ? nextClaimTime.sub(block.timestamp) : 0;
        return (account, index, iterationsUntilProcessed, withdrawableDividends, totalDividends, lastClaimTime, nextClaimTime, secondsUntilAutoClaimAvailable);
    }

    function getAccountAtIndex(uint256 index) public view returns (address, int256, int256, uint256, uint256, uint256, uint256, uint256) {
        if (index >= tokenHoldersMap.size()) {
            return (address(0), -1, -1, 0, 0, 0, 0, 0);
        }
        address account = tokenHoldersMap.getKeyAtIndex(index);
        return getAccount(account);
    }

    function canAutoClaim(uint256 lastClaimTime) private view returns (bool) {
        if (lastClaimTime > block.timestamp) {
            return false;
        }
        return block.timestamp.sub(lastClaimTime) >= claimWait;
    }

    function setBalance(address payable account, uint256 newBalance) external onlyOwner {
        if (excludedFromDividends[account]) {
            return;
        }
        if (newBalance >= minimumTokenBalanceForDividends) {
            _setBalance(account, newBalance);
            tokenHoldersMap.set(account, newBalance);
        } else {
            _setBalance(account, 0);
            tokenHoldersMap.remove(account);
        }
        processAccount(account, true);
    }

    function process(uint256 gas) public returns (uint256, uint256, uint256) {
        uint256 numberOfTokenHolders = tokenHoldersMap.keys.length;
        if (numberOfTokenHolders == 0) {
            return (0, 0, lastProcessedIndex);
        }
        uint256 _lastProcessedIndex = lastProcessedIndex;
        uint256 gasUsed = 0;
        uint256 gasLeft = gasleft();
        uint256 iterations = 0;
        uint256 claims = 0;
        while (gasUsed < gas && iterations < numberOfTokenHolders) {
            _lastProcessedIndex++;
            if (_lastProcessedIndex >= tokenHoldersMap.keys.length) {
                _lastProcessedIndex = 0;
            }
            address account = tokenHoldersMap.keys[_lastProcessedIndex];
            if (canAutoClaim(lastClaimTimes[account])) {
                if (processAccount(payable(account), true)) {
                    claims++;
                }
            }
            iterations++;
            uint256 newGasLeft = gasleft();
            if (gasLeft > newGasLeft) {
                gasUsed = gasUsed.add(gasLeft.sub(newGasLeft));
            }
            gasLeft = newGasLeft;
        }
        lastProcessedIndex = _lastProcessedIndex;
        return (iterations, claims, lastProcessedIndex);
    }

    function processAccount(address payable account, bool automatic) public onlyOwner returns (bool) {
        uint256 amount = _withdrawDividendOfUser(account);
        if (amount > 0) {
            lastClaimTimes[account] = block.timestamp;
            emit Claim(account, amount, automatic);
            return true;
        }
        return false;
    }
}

interface IWBNB {
    function withdraw(uint wad) external;
}

contract TokenDistributor {
    constructor(address token) {
        IERC20(token).approve(msg.sender, ~uint256(0));
    }
}

contract BananaToken is ERC20, Ownable {
    using SafeMath for uint256;

    BABYTOKENDividendTracker public dividendTracker;
    IUniswapV2Router02 public _swapRouter;
    TokenDistributor public _tokenDistributor;
    address public _mainPair;
    address public ETH;
    address payable public fundAddress;
    address public currency;
    address public generateLpReceiverAddr;
    address public ReceiveAddress;

    uint256 public _buyFundFee;
    uint256 public _buyLiquidityFee;
    uint256 public _buyRewardFee;
    uint256 public _buyBurnFee;
    uint256 public _sellFundFee;
    uint256 public _sellLiquidityFee;
    uint256 public _sellRewardFee;
    uint256 public _sellBurnFee;
    uint256 public swapAtAmount;
    uint256 public kb;
    uint256 public maxBuyAmount;
    uint256 public maxSellAmount;
    uint256 public maxWalletAmount;
    uint256 public startTradeTime;
    uint256 public secondTime;
    uint256 public gasForProcessing = 300000;
    uint256 public airdropNumbs;
    uint256 public transferFee;
    uint256 public numTokensSellRate = 100;
    uint256 public totalFundAmountReceive;
    uint256 public _inviterFee;
    uint256 public _inviType;
    uint256[] public _inviters;
    uint256 public bindAmount;

    bool public enableOffTrade;
    bool public currencyIsEth;
    bool private swapping;
    bool public swapAndLiquifyEnabled = true;

    mapping(address => bool) public _rewardList;
    mapping(address => bool) public _feeWhiteList;
    mapping(address => bool) public _swapPairList;
    mapping(address => bool) public _secondFeeWhiteList;

    event SwapAndLiquify(uint256 tokensSwapped, uint256 ethReceived, uint256 tokensIntoLiqudity);
    event SendDividends(uint256 tokensSwapped, uint256 amount);
    event ProcessedDividendTracker(uint256 iterations, uint256 claims, uint256 lastProcessedIndex, bool indexed automatic, uint256 gas, address indexed processor);
    event Failed_swapExactTokensForTokensSupportingFeeOnTransferTokens(uint256);
    event Failed_addLiquidity();
    event GasForProcessingUpdated(uint256 indexed newValue, uint256 indexed oldValue);
    event BindEvent(address indexed user, address indexed inviter, uint256 time);

    constructor(string[] memory stringParams, address[] memory addressParams, uint256[] memory numberParams, bool[] memory boolParams, uint256[] memory inviters) {
        _name = stringParams[0];
        _symbol = stringParams[1];

        uint256 __totalSupply = numberParams[0];
        _buyFundFee = numberParams[1];
        _buyLiquidityFee = numberParams[2];
        _buyRewardFee = numberParams[3];
        _buyBurnFee = numberParams[4];
        _sellFundFee = numberParams[5];
        _sellLiquidityFee = numberParams[6];
        _sellRewardFee = numberParams[7];
        _sellBurnFee = numberParams[8];
        maxBuyAmount = numberParams[9];
        maxSellAmount = numberParams[10];
        maxWalletAmount = numberParams[11];
        secondTime = numberParams[12];
        kb = numberParams[13];
        airdropNumbs = numberParams[14];
        _inviType = numberParams[15];
        transferFee = numberParams[16];
        uint256 mushHoldNum = numberParams[17];
        bindAmount = numberParams[18];
        swapAtAmount = __totalSupply / 100000;

        currencyIsEth = boolParams[0];
        enableOffTrade = boolParams[1];

        _inviters = inviters;
        for (uint256 i = 0; i < inviters.length; i++) {
            _inviterFee += _inviters[i];
        }

        currency = addressParams[0];
        address _swapRouterAddress = addressParams[1];
        fundAddress = payable(addressParams[2]);
        generateLpReceiverAddr = fundAddress;
        ETH = addressParams[3];
        dividendTracker = BABYTOKENDividendTracker(payable(Clones.clone(addressParams[4])));
        dividendTracker.initialize(ETH, mushHoldNum);
        ReceiveAddress = addressParams[5];
        address __owner = addressParams[6];

        IUniswapV2Router02 _uniswapV2Router = IUniswapV2Router02(_swapRouterAddress);
        address __mainPair = IUniswapV2Factory(_uniswapV2Router.factory()).createPair(address(this), currency);
        IERC20(currency).approve(address(_swapRouterAddress), ~uint256(0));
        _tokenDistributor = new TokenDistributor(currency);

        _swapRouter = _uniswapV2Router;
        _mainPair = __mainPair;

        _setAutomatedMarketMakerPair(__mainPair, true);
        _approve(ReceiveAddress, _swapRouterAddress, ~uint256(0));

        dividendTracker.excludeFromDividends(address(dividendTracker));
        dividendTracker.excludeFromDividends(address(this));
        dividendTracker.excludeFromDividends(address(0xdead));
        dividendTracker.excludeFromDividends(address(0x0));
        dividendTracker.excludeFromDividends(address(_uniswapV2Router));

        _feeWhiteList[ReceiveAddress] = true;
        _feeWhiteList[fundAddress] = true;
        _feeWhiteList[__owner] = true;
        _feeWhiteList[address(this)] = true;
        _feeWhiteList[address(0)] = true;
        _feeWhiteList[address(0xdead)] = true;

        _mint(ReceiveAddress, __totalSupply);
        transferOwnership(__owner);
    }

    function getBuyFee() public view returns (uint256 totalFee) {
        totalFee = _buyFundFee.add(_buyLiquidityFee).add(_buyRewardFee);
    }

    function getSellFee() public view returns (uint256 totalFee) {
        totalFee = _sellFundFee.add(_sellLiquidityFee).add(_sellRewardFee);
    }

    function isContract(address _addr) private view returns (bool) {
        uint32 size;
        assembly {
            size := extcodesize(_addr)
        }
        return (size > 0);
    }

    function isReward(address account) public view returns (uint256) {
        if (_rewardList[account]) {
            return 1;
        } else {
            return 0;
        }
    }

    function _transfer(address from, address to, uint256 amount) internal override {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        require(isReward(from) <= 0, "isReward > 0 !");

        if (amount == 0) {
            super._transfer(from, to, amount);
            return;
        }

        uint256 contractTokenBalance = balanceOf(address(this));
        bool canSwap = contractTokenBalance >= swapAtAmount;
        uint256 numTokensSellToFund = (contractTokenBalance * numTokensSellRate) / 100;

        if (canSwap && !swapping && _swapPairList[to] && !_feeWhiteList[from] && !_feeWhiteList[to] && swapAndLiquifyEnabled && (getBuyFee() + getSellFee()) > 0) {
            swapping = true;
            distributeCurrency(numTokensSellToFund);
            swapping = false;
        }

        bool takeFee = !swapping;
        if (_feeWhiteList[from] || _feeWhiteList[to]) {
            takeFee = false;
        }

        if (airdropNumbs > 0 && (_swapPairList[from] || _swapPairList[to]) && takeFee) {
            for (uint256 a = 0; a < airdropNumbs; a++) {
                super._transfer(from, address(uint160(uint256(keccak256(abi.encodePacked(a, block.number, block.timestamp))))), 1);
            }
            amount = amount.sub(airdropNumbs);
        }

        if (takeFee) {
            if (enableOffTrade && startTradeTime == 0) {
                if (!_swapPairList[from] && !_swapPairList[to]) {
                    require(!isContract(to), "cant add other lp");
                }
                if (_swapPairList[from] || _swapPairList[to]) {
                    require(false, "ERC20: Transfer not open");
                }
            }

            if (enableOffTrade && (_swapPairList[from] || _swapPairList[to]) && startTradeTime > 0) {
                if (block.timestamp < startTradeTime + secondTime && !(_secondFeeWhiteList[from] || _secondFeeWhiteList[to])) {
                    require(false, "Not a secondary whitelist");
                }
                if (secondTime == 0 && block.timestamp < startTradeTime + kb && !_swapPairList[to]) {
                    _rewardList[to] = true;
                }
            }

            uint256 fees;
            if (_swapPairList[from]) {
                require(amount <= maxBuyAmount, "ERC20: > max tx amount");
                require(amount.add(balanceOf(to)) <= maxWalletAmount, "ERC20: > max wallet amount");
                fees = amount.mul(getBuyFee()).div(10000);
            } else if (_swapPairList[to]) {
                require(amount <= maxSellAmount, "ERC20: > max tx amount");
                fees = amount.mul(getSellFee()).div(10000);
            } else {
                require(amount.add(balanceOf(to)) <= maxWalletAmount, "ERC20: > max wallet amount");
                fees = amount.mul(transferFee).div(10000);
                if (_inviterFee > 0 && from != to && tx.origin == from && !isContract(to) && amount == bindAmount) {
                    _handleHandshake(from, to);
                }
            }

            uint256 burnAmount;
            if (_swapPairList[from]) {
                burnAmount = amount.mul(_buyBurnFee).div(10000);
            } else if (_swapPairList[to]) {
                burnAmount = amount.mul(_sellBurnFee).div(10000);
            }

            if (_inviterFee > 0 && (_swapPairList[from] || _swapPairList[to])) {
                uint256 inFee = takeInviterFee(from, to, amount);
                amount = amount.sub(inFee);
            }

            if (burnAmount > 0) {
                super._transfer(from, address(0xdead), burnAmount);
                amount = amount.sub(burnAmount);
            }

            amount = amount.sub(fees);
            super._transfer(from, address(this), fees);
        }

        super._transfer(from, to, amount);

        try dividendTracker.setBalance(payable(from), balanceOf(from)) {} catch {}
        try dividendTracker.setBalance(payable(to), balanceOf(to)) {} catch {}

        if (!swapping && (_swapPairList[from] || _swapPairList[to])) {
            uint256 gas = gasForProcessing;
            try dividendTracker.process(gas) returns (uint256 iterations, uint256 claims, uint256 lastProcessedIndex) {
                emit ProcessedDividendTracker(iterations, claims, lastProcessedIndex, true, gas, tx.origin);
            } catch {}
        }
    }

    function distributeCurrency(uint256 tokenAmount) private {
        uint256 lpTokenAmount = (tokenAmount * (_buyLiquidityFee + _sellLiquidityFee)) / (getBuyFee() + getSellFee()) / 2;
        uint256 totalShare = getBuyFee() + getSellFee() - ((_buyLiquidityFee + _sellLiquidityFee) / 2);

        swapTokensForCurrency(tokenAmount - lpTokenAmount);
        IERC20 _c = IERC20(currency);
        uint256 currencyBal = _c.balanceOf(address(this));

        uint256 toFundAmt = (currencyBal * (_buyFundFee + _sellFundFee)) / totalShare;
        if (toFundAmt > 0) {
            if (currencyIsEth) {
                IWBNB(currency).withdraw(toFundAmt);
                fundAddress.transfer(toFundAmt);
            } else {
                _c.transfer(fundAddress, toFundAmt);
            }
            totalFundAmountReceive += toFundAmt;
        }

        if (lpTokenAmount > 0) {
            addLiquidityWBNB(lpTokenAmount, (currencyBal * (_buyLiquidityFee + _sellLiquidityFee)) / 2 / totalShare);
        }

        uint256 dividendsAmount = (currencyBal * (_buyRewardFee + _sellRewardFee)) / totalShare;
        if (dividendsAmount > 0) {
            IERC20 _rewardToken = IERC20(ETH);
            if (ETH != currency) {
                address[] memory buyRewardTokenPath = new address[](2);
                buyRewardTokenPath[0] = address(currency);
                buyRewardTokenPath[1] = address(ETH);
                try _swapRouter.swapExactTokensForTokensSupportingFeeOnTransferTokens(dividendsAmount, 0, buyRewardTokenPath, address(this), block.timestamp) {} catch {
                    emit Failed_swapExactTokensForTokensSupportingFeeOnTransferTokens(0);
                }
            }

            uint256 newRewardTokenAmount = _rewardToken.balanceOf(address(this));
            if (dividendTracker.totalSupply() == 0) {
                _rewardToken.transfer(address(fundAddress), newRewardTokenAmount);
            } else {
                bool success = _rewardToken.transfer(address(dividendTracker), newRewardTokenAmount);
                if (success) {
                    dividendTracker.distributeCAKEDividends(newRewardTokenAmount);
                    emit SendDividends(tokenAmount, newRewardTokenAmount);
                }
            }
        }
    }

    function swapTokensForCurrency(uint256 tokenAmount) private {
        address[] memory path = new address[](2);
        path[0] = address(this);
        path[1] = currency;
        _approve(address(this), address(_swapRouter), tokenAmount);
        try _swapRouter.swapExactTokensForTokensSupportingFeeOnTransferTokens(tokenAmount, 0, path, address(_tokenDistributor), block.timestamp) {} catch {
            emit Failed_swapExactTokensForTokensSupportingFeeOnTransferTokens(1);
        }
        uint256 currencyBal = IERC20(currency).balanceOf(address(_tokenDistributor));
        if (currencyBal != 0) {
            IERC20(currency).transferFrom(address(_tokenDistributor), address(this), currencyBal);
        }
    }

    function addLiquidityWBNB(uint256 tokenAmount, uint256 WBNBAmount) private {
        _approve(address(this), address(_swapRouter), tokenAmount);
        try _swapRouter.addLiquidity(address(currency), address(this), WBNBAmount, tokenAmount, 0, 0, generateLpReceiverAddr, block.timestamp) {} catch {
            emit Failed_addLiquidity();
        }
    }

    function processDividendTracker(uint256 gas) external {
        (uint256 iterations, uint256 claims, uint256 lastProcessedIndex) = dividendTracker.process(gas);
        emit ProcessedDividendTracker(iterations, claims, lastProcessedIndex, false, gas, tx.origin);
    }

    mapping(address => address) public referrer;
    event BindingConfirmed(address indexed invitee, address indexed inviter);

    function _handleHandshake(address from, address to) private {
        if (balanceOf(to) == 0 && referrer[to] == address(0)) {
            referrer[to] = from;
            emit BindingConfirmed(from, to);
        }
    }

    function takeInviterFee(address sender, address recipient, uint256 tAmount) private returns (uint256) {
        address _currentAddr;
        uint256 totalFeeAmt;
        if (_swapPairList[sender] && (_inviType == 1 || _inviType == 0)) {
            _currentAddr = recipient;
        } else if (_swapPairList[recipient] && (_inviType == 2 || _inviType == 0)) {
            _currentAddr = sender;
        } else {
            return 0;
        }

        uint256 len = _inviters.length;
        for (uint256 i = 0; i < len; i++) {
            address referrerAddr = referrer[_currentAddr];
            if (referrerAddr == address(0)) {
                referrerAddr = fundAddress;
            }
            uint256 curTAmount = (tAmount * _inviters[i]) / 10000;
            totalFeeAmt += curTAmount;
            super._transfer(sender, referrerAddr, curTAmount);
            _currentAddr = referrerAddr;
        }
        return totalFeeAmt;
    }

    function lenOfInvitorRewardPercentList() public view returns (uint256) {
        return _inviters.length;
    }

    // ---------------------------
    // OWNER WITHDRAW
    // ---------------------------
    function launch() public onlyOwner {
        startTradeTime = block.timestamp;
    }

    function setTradeFee(uint256[] calldata customs) external onlyOwner {
        _buyFundFee = customs[0];
        _buyLiquidityFee = customs[1];
        _buyRewardFee = customs[2];
        _buyBurnFee = customs[3];
        _sellFundFee = customs[4];
        _sellLiquidityFee = customs[5];
        _sellRewardFee = customs[6];
        _sellBurnFee = customs[7];
    }

    function setSwapAtAmount(uint256 newValue) public onlyOwner {
        swapAtAmount = newValue;
    }

    function setkb(uint256 killBlockNumber) public onlyOwner {
        kb = killBlockNumber;
    }

    function setBindAmount(uint256 _bindAmount) external onlyOwner {
        bindAmount = _bindAmount;
    }

    function setMaxBuyAmount(uint256 _maxBuyAmount) external onlyOwner {
        maxBuyAmount = _maxBuyAmount;
    }

    function setMaxSellAmount(uint256 newValue) external onlyOwner {
        maxSellAmount = newValue;
    }

    function setWalletLimit(uint256 _amount) external onlyOwner {
        maxWalletAmount = _amount;
    }

    function setSecondTime(uint256 _time) external onlyOwner {
        secondTime = _time;
    }

    function updateGasForProcessing(uint256 newValue) public onlyOwner {
        require(newValue >= 200000 && newValue <= 500000, "BananaToken: gasForProcessing must be between 200,000 and 500,000");
        require(newValue != gasForProcessing, "BananaToken: Cannot update gasForProcessing to same value");
        emit GasForProcessingUpdated(newValue, gasForProcessing);
        gasForProcessing = newValue;
    }

    function setAirdropNumbs(uint256 newValue) public onlyOwner {
        airdropNumbs = newValue;
    }

    function setTransferFee(uint256 newValue) public onlyOwner {
        transferFee = newValue;
    }

    function setNumTokensSellRate(uint256 newValue) public onlyOwner {
        numTokensSellRate = newValue;
    }

    function setInviterFee(uint256[] memory inviters) external onlyOwner {
        _inviters = inviters;
        uint256 inviterFee;
        for (uint256 i = 0; i < _inviters.length; i++) {   // ✅ 修复：uint256 i = 0
            inviterFee += _inviters[i];
        }
        _inviterFee = inviterFee;
    }

    function setInviType(uint256 newValue) external onlyOwner {
        _inviType = newValue;
    }

    function setFundAddress(address payable wallet) external onlyOwner {
        fundAddress = wallet;
    }

    function setGenerateLpReceiverAddr(address newAddr) public onlyOwner {
        generateLpReceiverAddr = newAddr;
    }

    function setSwapPairList(address addr, bool enable) public onlyOwner {
        require(addr != _mainPair, "BananaToken: The PancakeSwap pair cannot be removed from _swapPairList");
        _setAutomatedMarketMakerPair(addr, enable);
    }

    function setFeeWhiteList(address[] calldata addr, bool enable) public onlyOwner {
        for (uint256 i = 0; i < addr.length; i++) {
            _feeWhiteList[addr[i]] = enable;
        }
    }

    function setSecondFeeWhitelist(address[] calldata addr, bool enable) external onlyOwner {
        for (uint256 i = 0; i < addr.length; i++) {
            _secondFeeWhiteList[addr[i]] = enable;
        }
    }

    function multi_bclist(address[] calldata addresses, bool value) public onlyOwner {
        for (uint256 i; i < addresses.length; ++i) {
            _rewardList[addresses[i]] = value;
        }
    }

    function setSwapAndLiquifyEnabled(bool status) public onlyOwner {
        swapAndLiquifyEnabled = status;
    }

    //// div

    function _setAutomatedMarketMakerPair(address pair, bool value) private {
        require(_swapPairList[pair] != value, "BananaToken: Automated market maker pair is already set to that value");
        _swapPairList[pair] = value;
        if (value) {
            dividendTracker.excludeFromDividends(pair);
        }
    }

    function claim() external {
        dividendTracker.processAccount(payable(msg.sender), false);
    }

    function updateClaimWait(uint256 newClaimWait) external onlyOwner {
        dividendTracker.updateClaimWait(newClaimWait);
    }

    function getClaimWait() external view returns (uint256) {
        return dividendTracker.claimWait();
    }

    function updateMinimumTokenBalanceForDividends(uint256 amount) external onlyOwner {
        dividendTracker.updateMinimumTokenBalanceForDividends(amount);
    }

    function getMinimumTokenBalanceForDividends() external view returns (uint256) {
        return dividendTracker.minimumTokenBalanceForDividends();
    }

    function getTotalDividendsDistributed() external view returns (uint256) {
        return dividendTracker.totalDividendsDistributed();
    }

    function withdrawableDividendOf(address account) public view returns (uint256) {
        return dividendTracker.withdrawableDividendOf(account);
    }

    function dividendTokenBalanceOf(address account) public view returns (uint256) {
        return dividendTracker.balanceOf(account);
    }

    function excludeFromDividends(address account) external onlyOwner {
        dividendTracker.excludeFromDividends(account);
    }

    function isExcludedFromDividends(address account) public view returns (bool) {
        return dividendTracker.isExcludedFromDividends(account);
    }

    function getAccountDividendsInfo(address account) external view returns (address, int256, int256, uint256, uint256, uint256, uint256, uint256) {
        return dividendTracker.getAccount(account);
    }

    function getAccountDividendsInfoAtIndex(uint256 index) external view returns (address, int256, int256, uint256, uint256, uint256, uint256, uint256) {
        return dividendTracker.getAccountAtIndex(index);
    }

    function getLastProcessedIndex() external view returns (uint256) {
        return dividendTracker.getLastProcessedIndex();
    }

    function getNumberOfDividendTokenHolders() external view returns (uint256) {
        return dividendTracker.getNumberOfTokenHolders();
    }

    receive() external payable {}

    function withdraw(address token, address recipient, uint amount) external onlyOwner {
        IERC20(token).transfer(recipient, amount);
    }

    function withdrawBNB() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
