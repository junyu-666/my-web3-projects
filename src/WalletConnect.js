/* eslint-disable no-unused-vars */

// 导入必要的React钩子和ethers库
import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Wallet, ArrowRightLeft, Hammer } from 'lucide-react';
import Web3Modal from 'web3modal';


// 定义支持的区块链网络
const chains = {
  1: { name: 'Ethereum 主网', rpcUrl: 'https://mainnet.infura.io/v3/YOUR-PROJECT-ID', nativeCurrency: 'ETH' },
  56: { name: 'BNB Smart Chain', rpcUrl: 'https://bsc-dataseed.binance.org/', nativeCurrency: 'BNB' },
  10: { name: 'Optimism', rpcUrl: 'https://mainnet.optimism.io', nativeCurrency: 'ETH' },
  42161: { name: 'Arbitrum One', rpcUrl: 'https://arb1.arbitrum.io/rpc', nativeCurrency: 'ETH' },
  8453: { name: 'Base', rpcUrl: 'https://mainnet.base.org', nativeCurrency: 'ETH' },
  534352: { name: 'Scroll', rpcUrl: 'https://rpc.scroll.io', nativeCurrency: 'ETH' },
};

// ETH69代币合约地址
const ETH69_CONTRACT_ADDRESS = '0xC8F8294A24023235Be5f568b265e83064F2d9405';

function WalletConnect() {
  // 定义状态变量
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState('');
  const [chainId, setChainId] = useState('');
  const [selectedChain, setSelectedChain] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [tokenContractAddress, setTokenContractAddress] = useState('');
  const [tokenBalance, setTokenBalance] = useState('');
  const [selectedToken, setSelectedToken] = useState('native');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [transactionStatus, setTransactionStatus] = useState('');
  const [tokenDecimals, setTokenDecimals] = useState(18);
  const [eth69Balance, setEth69Balance] = useState('');

  const providerOptions = {
    metamask: {
        display: {
            name: "MetaMask",
            description: "Connect with the MetaMask extension"
        }
    }
};

 
  const web3Modal = new Web3Modal({
      cacheProvider: true,
      providerOptions
  });

  // 获取钱包余额
  const getBalance = useCallback(async (address) => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      try {
        const balance = await provider.getBalance(address);
        setBalance(parseFloat(ethers.utils.formatEther(balance)).toFixed(5));
        // 获取ETH69代币余额
        await getETH69Balance(address, provider);
      } catch (err) {
        console.error("获取余额时出错:", err);
      }
    }
  }, []);

  // 获取ETH69代币余额
  const getETH69Balance = async (address, provider) => {
    try {
      const currentChainId = await provider.getNetwork().then(network => network.chainId);
      if (currentChainId !== 8453) {
        setEth69Balance("不适用");
        return 0; // 返回0表示不适用
      }
    
      const erc20Abi = [
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)"
      ];
      const contract = new ethers.Contract(ETH69_CONTRACT_ADDRESS, erc20Abi, provider);
      const balance = await contract.balanceOf(address);
      const decimals = await contract.decimals();
      const formattedBalance = parseFloat(ethers.utils.formatUnits(balance, decimals)).toFixed(2);
      setEth69Balance(formattedBalance);
      return formattedBalance; // 返回格式化后的余额
    } catch (err) {
      console.error("获取ETH69余额时出错:", err);
      setEth69Balance("获取失败");
      return 0; // 返回0表示获取失败
    }
  };

  // 获取当前连接的钱包
  const getCurrentWalletConnected = useCallback(async () => {
    if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          await getBalance(accounts[0]);
          await getChainId();
        }
      } catch (err) {
        console.error(err.message);
      }
    }
  }, [getBalance]);

  // 添加钱包监听器
  const addWalletListener = useCallback(() => {
    if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", async (accounts) => {
        setWalletAddress(accounts[0]);
        await getBalance(accounts[0]);
      });
      window.ethereum.on("chainChanged", async () => {
        await getChainId();
        if (walletAddress) {
          await getBalance(walletAddress);
        }
      });
    } else {
      setWalletAddress("");
      setBalance("");
      console.log("请安装 MetaMask");
    }
  }, [getBalance, walletAddress]);

  // 获取当前链ID
  const getChainId = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const parsedChainId = parseInt(chainId, 16);
        setChainId(parsedChainId);
        setSelectedChain(parsedChainId.toString());
      } catch (err) {
        console.error("获取链 ID 时出错:", err);
      }
    }
  };

  // 初始化效果
  useEffect(() => {
    const init = async () => {
      await getCurrentWalletConnected();
      addWalletListener();
    };
    init();
  }, [getCurrentWalletConnected, addWalletListener]);

  // 连接钱包
  const connectWallet = async () => {
    const provider = await web3Modal.connect();
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    const accounts = await ethersProvider.listAccounts(); // 获取账户
    setWalletAddress(accounts[0]);
    await getBalance(accounts[0]);
    await getChainId();
  };

  // 切换链
  const switchChain = async (chainId) => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${parseInt(chainId).toString(16)}` }],
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: `0x${parseInt(chainId).toString(16)}`,
                  chainName: chains[chainId].name,
                  rpcUrls: [chains[chainId].rpcUrl],
                  nativeCurrency: {
                    name: chains[chainId].nativeCurrency,
                    symbol: chains[chainId].nativeCurrency,
                    decimals: 18
                  }
                },
              ],
            });
          } catch (addError) {
            console.error("添加链失败:", addError);
          }
        }
        console.error("切换链失败:", switchError);
      }
    }
  };

  // 处理链变更
  const handleChainChange = (event) => {
    const value = event.target.value;
    setSelectedChain(value);
    switchChain(value);
  };

  // 处理代币类型变更
  const handleTokenChange = (event) => {
    const value = event.target.value;
    setSelectedToken(value);
    if (value === 'native') {
      setTokenContractAddress('');
      setTokenBalance('');
      setTokenSymbol(chains[chainId]?.nativeCurrency || '');
      setTokenDecimals(18);
    } else {
      setTokenContractAddress('');
      setTokenBalance('');
      setTokenSymbol('');
      setTokenDecimals(18);
    }
  };

  // 处理转账
  const handleTransfer = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        setTransactionStatus('处理中...');
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        let tx;
        if (selectedToken === 'native') {
          tx = await signer.sendTransaction({
            to: recipientAddress,
            value: ethers.utils.parseEther(amount)
          });
        } else {
          const erc20Abi = [
            "function transfer(address to, uint256 amount) returns (bool)",
            "function decimals() view returns (uint8)"
          ];
          const contract = new ethers.Contract(tokenContractAddress, erc20Abi, signer);
          const decimals = await contract.decimals();
          const amountInSmallestUnit = ethers.utils.parseUnits(amount, decimals);
          tx = await contract.transfer(recipientAddress, amountInSmallestUnit);
        }
        console.log("交易已发送:", tx.hash);
        setTransactionStatus('交易已发送，等待确认...');
        await tx.wait();
        console.log("交易已确认");
        setTransactionStatus('交易已确认');
        await getBalance(walletAddress);
        if (selectedToken !== 'native') {
          await handleTokenBalanceCheck();
        }
      } catch (err) {
        console.error("交易失败:", err);
        if (err.code === 'ACTION_REJECTED') {
          setTransactionStatus('交易被用户取消');
        } else {
          setTransactionStatus('交易失败: ' + err.message);
        }
      }
    }
  };

  // 处理代币余额检查
  const handleTokenBalanceCheck = async () => {
    if (typeof window.ethereum !== "undefined" && tokenContractAddress) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const erc20Abi = [
          "function balanceOf(address owner) view returns (uint256)",
          "function decimals() view returns (uint8)",
          "function symbol() view returns (string)"
        ];
        const contract = new ethers.Contract(tokenContractAddress, erc20Abi, provider);
        const balance = await contract.balanceOf(walletAddress);
        const decimals = await contract.decimals();
        const symbol = await contract.symbol();
        const formattedBalance = parseFloat(ethers.utils.formatUnits(balance, decimals)).toFixed(2);
        setTokenBalance(formattedBalance);
        setTokenSymbol(symbol);
        setTokenDecimals(decimals); // 保存代币小数位数，用于将来可能的精确计算
      } catch (err) {
        console.error("查询代币余额失败:", err);
        setTokenBalance("查询失败");
      }
    }
  };

  // 处理铸造ETH69代币
  const handleMintETH69 = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (parseInt(currentChainId, 16) !== 8453) {
          const confirmSwitch = window.confirm('您当前不在Base链上。是否切换到Base链?');
          if (confirmSwitch) {
            try {
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x2105' }],
              });
            } catch (switchError) {
              console.error("切换到Base链失败:", switchError);
              setTransactionStatus('切换到Base链失败');
              return;
            }
          } else {
            setTransactionStatus('请先切换到Base链');
            return;
          }
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const eth69Balance = await getETH69Balance(walletAddress, provider); // 使用返回值

        if (parseFloat(eth69Balance) > 0) {
          setTransactionStatus('您已经铸造过ETH69代币');
          return;
        }

        setTransactionStatus('处理中...');
        const signer = provider.getSigner();
        const tx = await signer.sendTransaction({
          to: ETH69_CONTRACT_ADDRESS,
          value: ethers.utils.parseEther('0.00069')
        });
        console.log("交易已发送:", tx.hash);
        setTransactionStatus('交易已发送，等待确认...');
        await tx.wait();
        console.log("交易已确认");
        setTransactionStatus('ETH69代币铸造成功');
        await getBalance(walletAddress);
      } catch (err) {
        console.error("铸造失败:", err);
        if (err.code === 'ACTION_REJECTED') {
          setTransactionStatus('铸造被用户取消');
        } else {
          setTransactionStatus('铸造失败: ETH余额不足');
        }
      }
    }
  };

  // 渲染UI
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <select 
          value={selectedChain} 
          onChange={handleChainChange} 
          className="p-2 border rounded-md"
        >
          <option value="">选择链</option>
          {Object.entries(chains).map(([id, chain]) => (
            <option key={id} value={id}>{chain.name}</option>
          ))}
        </select>
        <div>
          {balance && (
            <span className="mr-4 bg-gray-100 px-3 py-1 rounded-full text-sm">
              余额: {balance} {chains[chainId]?.nativeCurrency}
            </span>
          )}
          <button 
            onClick={connectWallet} 
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300 flex items-center"
          >
            <Wallet className="mr-2" size={18} />
            {walletAddress && walletAddress.length > 0
              ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`
              : "连接钱包"}
          </button>
        </div>
      </div>
      <div className="border rounded-lg p-6 shadow-md mb-6">
        <h2 className="text-2xl font-bold mb-6">转账</h2>
        <div className="mb-4">
          <label htmlFor="token-type" className="block mb-2 font-medium">代币类型</label>
          <select 
            id="token-type" 
            value={selectedToken} 
            onChange={handleTokenChange} 
            className="w-full p-2 border rounded-md"
          >
            <option value="native">主网币 ({chains[chainId]?.nativeCurrency})</option>
            <option value="erc20">ERC20 代币</option>
          </select>
        </div>
        {selectedToken === 'erc20' && (
          <div className="mb-4">
            <label htmlFor="token-address" className="block mb-2 font-medium">ERC20 代币合约地址</label>
            <div className="flex">
              <input
                id="token-address"
                placeholder="输入合约地址"
                value={tokenContractAddress}
                onChange={(e) => setTokenContractAddress(e.target.value)}
                className="flex-grow p-2 border rounded-l-md"
              />
              <button 
                onClick={handleTokenBalanceCheck} 
                className="px-4 py-2 bg-green-500 text-white rounded-r-md hover:bg-green-600 transition duration-300"
              >
                查询余额
              </button>
            </div>
          </div>
        )}
        {tokenBalance && (
          <div className="bg-gray-100 p-3 rounded-md mb-4">
            代币余额: {tokenBalance} {tokenSymbol}
          </div>
        )}
        <div className="mb-4">
          <label htmlFor="recipient" className="block mb-2 font-medium">接收地址</label>
          <input
            id="recipient"
            placeholder="输入接收地址"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="amount" className="block mb-2 font-medium">转账金额</label>
          <input
            id="amount"
            type="number"
            placeholder={`输入金额 (${selectedToken === 'native' ? chains[chainId]?.nativeCurrency : tokenSymbol})`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <button 
          onClick={handleTransfer} 
          className="w-full py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300 flex items-center justify-center"
        >
          <ArrowRightLeft className="mr-2" size={18} />
          转账
        </button>
      </div>
      <div className="border rounded-lg p-6 shadow-md mb-6">
        <h2 className="text-2xl font-bold mb-6">ETH69代币信息</h2>
        <p className="mb-4">ETH69代币合约地址: {ETH69_CONTRACT_ADDRESS}</p>
        <p className="mb-4">当前ETH69代币余额: {eth69Balance} ETH69</p>
      </div>
      <div className="border rounded-lg p-6 shadow-md">
        <h2 className="text-2xl font-bold mb-6">铸造ETH69代币</h2>
        <p className="mb-4">点击下方按钮将向指定地址转账0.00069 ETH以铸造ETH69代币</p>
        <button 
          onClick={handleMintETH69} 
          className="w-full py-3 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition duration-300 flex items-center justify-center"
        >
          <Hammer className="mr-2" size={18} />
          铸造ETH69代币
        </button>
      </div>
      {transactionStatus && (
        <div className="mt-4 p-3 bg-gray-100 rounded-md text-center">
          {transactionStatus}
        </div>
      )}
    </div>
  );
}

export default WalletConnect;
