/* eslint-disable no-unused-vars */

// 导入必要的React钩子和ethers库
import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract } from 'wagmi';

function BaseMeme() {
  // 定义状态变量
  const { isConnected, address } = useAccount();
  const walletAddress = address
  // const [totalSupply, setTotalSupply] = useState('');
  // const [tokenBalance, setTokenBalance] = useState('');
  const [isMinting, setIsMinting] = useState(false); // 地址铸造状态
  // const [mintingEnded, setMintingEnded] = useState(false); // 新增状态变量
  const [showSuccessModal, setShowSuccessModal] = useState(false); // 添加状态变量以控制弹窗显示
  const [lastBalance, setLastBalance] = useState(0); // 添加状态变量以存储上次余额
  const [mintTx, setMintTx] = useState(''); // 添加状态变量以存储交易哈希
  const [nextMintTime, setNextMintTime] = useState(null); // 添加状态变量以存储下一次铸币时间
  // 添加状态变量以存储倒计时
  const [timeLeft, setTimeLeft] = useState(0); // 新增状态变量
  const [showHelpModal, setShowHelpModal] = useState(false); // 新增说明弹窗状态

  const contractABI = [
    {
      "inputs": [],
      "name": "mintingEnded",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  const wagmiContractConfig = {
    address: '0x5656Cf1E37b2336a8Ef065ab16405aa5E756C99A', // Replace with your contract address
    abi: contractABI,
  };
  // 读取合约铸造状态
  const { data: mintingEnded, error: err1 } = useReadContract({
    ...wagmiContractConfig,
    functionName: 'mintingEnded',
    args: [],
  });
  console.log(err1)
  // 读取总供应量
  const { data: totalSupply1, error: err2 } = useReadContract({
    ...wagmiContractConfig,
    functionName: 'totalSupply',
    args: [],
  });
  console.log(err2)
  // 读取代币余额
  const { data: tokenBalance1, error: err3 } = useReadContract({
    ...wagmiContractConfig,
    functionName: 'balanceOf',
    args: [walletAddress],
  });
  console.log(err3)
  // 将uint格式转成正常格式
  const totalSupply = totalSupply1 ? ethers.utils.formatUnits(totalSupply1, 18) : 'N/A';
  const tokenBalance = tokenBalance1 ? ethers.utils.formatUnits(tokenBalance1, 18) : 'N/A';

  // 铸造 BMI 的方法
  const mintBMI = async () => {
    setIsMinting(true); // 开始铸造时设置状态为真
    const contractAddress = '0x5656Cf1E37b2336a8Ef065ab16405aa5E756C99A';
    const abi = [
      "function mint()",
      "function balanceOf(address owner) view returns (uint256)",
      "function lastMint(address owner) view returns (uint256)", // 添加获取最后铸币时间的方法
      "function nextMintInterval(address owner) view returns (uint256)" // 添加获取下一次铸币间隔的方法
    ];
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(); // 获取签名者
    const contract = new ethers.Contract(contractAddress, abi, signer);

    const tx = await contract.mint(); // 调用铸造方法
    await tx.wait(); // 等待交易确认
    setMintTx(tx.hash); // 保存交易哈希
    const newBalance = await contract.balanceOf(walletAddress); // 获取新的余额
    const mintedAmount = ethers.utils.formatUnits(newBalance, 18) - tokenBalance; // 计算铸造的数量
    setLastBalance(mintedAmount); // 更新上次铸造的余额

    // 新增代码：更新最后铸币时间和下一次铸币间隔
    const lastMintTime = await contract.lastMint(walletAddress);
    const mintInterval = await contract.nextMintInterval(walletAddress);
    const nextMintTime = lastMintTime.add(mintInterval);
    setNextMintTime(nextMintTime.toNumber()); // 更新状态
    setShowSuccessModal(true); // 显示弹窗
    setIsMinting(false); // 无论成功与否，铸造结束后重置状态
  };

  // 获取最后铸币时间和下一次铸币间隔
  const getMintingInfo = async () => {
    const contractAddress = '0x5656Cf1E37b2336a8Ef065ab16405aa5E756C99A';
    const abi = [
      "function lastMint(address owner) view returns (uint256)",
      "function nextMintInterval(address owner) view returns (uint256)"
    ];
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, abi, provider);
    const lastMintTime = await contract.lastMint(walletAddress);
    const mintInterval = await contract.nextMintInterval(walletAddress);
    const currentTime = Math.floor(Date.now() / 1000); // 获取当前时间（秒）
    const nextMintTime = lastMintTime.add(mintInterval); // 计算下一次铸币时间
    setNextMintTime(nextMintTime.toNumber()); // 更新状态
  };

  // 当钱包连接状态变化或者切换钱包时运行
  useEffect(() => {
    const init = async () => {
      if(isConnected){
        const walletAddress = address
        await getMintingInfo(); // 添加此行以获取铸币信息
      }
    };
    init();
  }, [address, isConnected]);

  // 更新倒计时的效果
  useEffect(() => {
    const interval = setInterval(() => {
      if (nextMintTime) {
        const currentTime = Math.floor(Date.now() / 1000); // 获取当前时间（秒）
        const remainingTime = nextMintTime - currentTime; // 计算剩余时间
        setTimeLeft(remainingTime > 0 ? remainingTime : 0); // 更新剩余时间
      }
    }, 1000); // 每秒更新一次

    return () => clearInterval(interval); // 清理定时器
  }, [nextMintTime]);

  // 将剩余时间转换为h-m-s格式
  const formatTimeLeft = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  // 渲染UI
  const renderMintButton = () => {
    if (timeLeft > 0) {
      return <button className="mt-4 px-8 py-3 bg-[#cccccc] text-black text-lg mb-1 rounded-lg hover:text-white">Mint available in: {formatTimeLeft(timeLeft)}</button>;
    }
    return (
      <button 
        onClick={isMinting ? null : mintBMI} // 如果正在铸造，禁用按钮
        className={`mt-4 px-8 py-3 ${isMinting ? 'bg-gray-500' : 'bg-white'} text-black text-lg mb-1 rounded-lg transition duration-300 flex text-center hover:bg-blue-500 hover:text-white`}
      >
        {isMinting ? 'Minting...' : 'Mint BasedMining'}
      </button>
    );
  };

  return (
  <div className="flex items-center justify-center min-h-screen bg-[#0a0a1e]">
    <div className="w-320 p-12 rounded-3xl shadow-[0_0_20px_rgba(0,0,0,0.6)] bg-gradient-to-br from-[#121235] to-[#0B0B1F] text-center">
      <div className='m-6 text-center'>
        <div className="flex justify-center mb-4">
          <ConnectButton />
        </div>
        <h1 className="text-6xl font-bold text-[#4AC8FF] mb-2">BasedMining</h1>
        <p className="text-2xl text-white mb-1">Free Mining for Everyone</p>
        <p className="text-xl text-white mb-1">all is onchain</p>
        {isConnected && (
          <div className='flex flex-col items-center justify-center'>
            <p className="text-3xl text-white mb-1">{mintingEnded ? 'Minting Ended' : 'Minting'}</p>
            <p className="text-white mb-1">Total Supply: {totalSupply ? Math.floor(totalSupply)+' BMI' : 'Loading...'}</p>
            <p className="text-white mb-1">Your BMI Balance: {tokenBalance ? Math.floor(tokenBalance)+' BMI' : 'Loading...'}</p>
            {renderMintButton()} {/* 调用渲染按钮的函数 */}
          </div>
        )}
        {showSuccessModal && ( // 弹窗显示条件
          <div className="fixed inset-0 flex items-center justify-center bg-opacity-50">
            <div className="bg-[#131336] p-12 rounded-3xl shadow-[0_0_20px_rgba(0,0,0,0.6)]">
              <div className='mx-4'>
                <h2 className="text-white text-3xl mb-2">Minted Amount: {lastBalance} BMI</h2>
                <p className="text-white text-2xl mb-1">
                  Transaction: <a href={`https://basescan.org/tx/${mintTx}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Basescan</a>
                </p>
                <button
                  onClick={() => setShowSuccessModal(false)} 
                  className="mt-4 px-4 py-2 bg-white text-black honer:bg-blue-500 hover:text-white rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    {/* 新增的圆形问号按钮 */}
    <button 
      className="fixed bottom-4 right-4 w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:text-black transition duration-300 text-2xl"
      onClick={() => setShowHelpModal(true)}
    >
      ?
    </button>
    {showHelpModal &&(
      <div className="fixed inset-0 flex items-center justify-center bg-opacity-50">
        <div className="bg-[#131336] p-12 items-center justify-center rounded-3xl shadow-[0_0_20px_rgba(0,0,0,0.6)]">
          <div className='flex flex-col items-center'>
            <h1 className='text-white text-2xl m-4'>How to play:</h1>
            <p className="text-white text-center">
                BasedMining is an ERC20 token that<br />
                you can mint for free.<br /><br />

                Each phase has its own mining multiplier.<br />
                The base mining value is a random<br />
                amount between 1 and 50 BMI<br /><br />

                In Phase 1, the mining output ranges<br />
                from 10 to 500 BMI per mint.<br /><br />

                Another random factor is the cooldown time,<br />
                which is independent of the phase and varies<br />
                from 5 to 60 minutes.<br /><br />

                Each phase lasts 3 days.<br /><br />

                28.10.2024 - BasedMining started!<br /><br />

                Once Phase 0 is reached, mining will end.<br />
                Fun and educational.<br /><br />

                Contract : <a href={`https://basescan.org/address/0x5656Cf1E37b2336a8Ef065ab16405aa5E756C99A`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">0x5656Cf1E37b2336a8Ef065ab16405aa5E756C99A</a>
            </p>
            <button 
            onClick={() => setShowHelpModal(false)}
            className='bg-white text-black px-4 py-2 mt-4 rounded-xl'
            >
              X
            </button>
          </div> 
        </div>
      </div>
    )}
    </div>
  );
}

export default BaseMeme;
