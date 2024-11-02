/* eslint-disable no-unused-vars */

// 导入必要的React钩子和ethers库
import React, { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query'
import { ethers } from 'ethers';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWaitForTransactionReceipt, useReadContract, useWriteContract  } from 'wagmi';

function BaseMeme() {
  const queryClient = useQueryClient()
  
  // 定义状态变量
  const { isConnected, address } = useAccount();
  const [walletAddress, setWalletAddress] = useState(address);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // 铸造成功弹窗显示
  const [lastBalance, setLastBalance] = useState(0); // 最后铸造数量
  const [mtBalance, setMtBalance] = useState(0);  // mint数量
  const [timeLeft, setTimeLeft] = useState(0); // 距离下次铸造剩余时间
  const [showHelpModal, setShowHelpModal] = useState(false); // 说明弹窗状态
  const [confirm, setConfirm] = useState(false);  // 合约交互成功状态
  const [confirmed, setConfirmed] = useState(false);  //本地mint成功状态
  const [activePhase, setActivePhase] = useState(0); // 轮次变量

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
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "lastMint",
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
          "name": "",
          "type": "address"
        }
      ],
      "name": "nextMintInterval",
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
      "inputs": [],
      "name": "mint",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
  ];

  const wagmiContractConfig = {
    address: '0xC8F8294A24023235Be5f568b265e83064F2d9405', 
    abi: contractABI,
  };

  // 读取合约铸造状态
  const { data: mintingEnded, queryKey: mintingKey, error: err1 } = useReadContract({
    ...wagmiContractConfig,
    functionName: 'mintingEnded',
    args: [],
  });
  // console.log(mintingEnded)
  // 读取总供应量
  const { data: totalSupply1, queryKey: totalSupplyKey, error: err2 } = useReadContract({
    ...wagmiContractConfig,
    functionName: 'totalSupply',
    args: [],
  });
  // console.log(err2)
  // 读取代币余额
  const { data: tokenBalance1, queryKey: tokenBalanceKey, error: err3 } = useReadContract({
    ...wagmiContractConfig,
    functionName: 'balanceOf',
    args: [walletAddress],
  });
  // console.log(err3)
  // 将uint格式转成正常格式
  const totalSupply = totalSupply1 ? ethers.utils.formatUnits(totalSupply1, 18) : 0;
  const tokenBalance = tokenBalance1 ? ethers.utils.formatUnits(tokenBalance1, 18) : 0;
  // console.log(totalSupply)
  // console.log(tokenBalance)
  // 读取最后铸造时间
  const { data: lastMintTime, queryKey: lastMintTimeKey, error: err4 } = useReadContract({
    ...wagmiContractConfig,
    functionName: 'lastMint',
    args: [walletAddress],
  });
  // console.log(err4)
  // 读取下一次铸币间隔
  const { data: mintInterval, queryKey: mintIntervalKey, error: err5 } = useReadContract({
    ...wagmiContractConfig,
    functionName: 'nextMintInterval',
    args: [walletAddress],
  });
  // console.log(err5)
  const lastMintTimeNum = lastMintTime ? Number(lastMintTime) : 0;
  const mintIntervalNum = mintInterval ? Number(mintInterval) : 0;
  // 计算下一次可铸造时间
  const nextMintTime = lastMintTimeNum + mintIntervalNum;
  // console.log(nextMintTime)

  // 铸造MBI代币
  const { data: hash, isPending , writeContract } = useWriteContract()
  // console.log("isPending ", isPending )
  async function mintMMI(e) {
    writeContract({
      ...wagmiContractConfig,
      functionName: 'mint',
      args: [],
    })
  }
  // 获mint合约状态
  const { isLoading: isConfirming, isSuccess: isConfirmed, queryKey: ConfirmKey } =
    useWaitForTransactionReceipt({
      hash
  })
  // console.log("isLoading", isConfirming, "isSuccess", isConfirmed)

  // 当合约写入成功
  useEffect(() => {
    if(isConfirmed){
      setConfirm(true)
    }
  }, [isConfirmed]);

  useEffect(() => {
    const init = async () => {
      if (isConnected) {
        setWalletAddress(address);
      }
      if (confirm) {
        setLastBalance(tokenBalance)
        queryClient.invalidateQueries({ mintingKey, totalSupplyKey, tokenBalanceKey, lastMintTimeKey, mintIntervalKey, ConfirmKey})
        setConfirmed(true);
        setConfirm(false);
      }
    };
    init();
  }, [address, isConnected, confirm]);

  // mint数量计算
  useEffect(() => {
    if (confirmed) {
      const mintBalance = tokenBalance - lastBalance
      // console.log("mintBalance", mintBalance)
      setMtBalance(mintBalance)
      // console.log("mint", mtBalance)
      setLastBalance(tokenBalance)
      setConfirmed(false);
    }
  }, [tokenBalance]);

  // 当mint数量变化且不为0时显示成功弹窗
  useEffect(() => {
    if(mtBalance > 0){
      setShowSuccessModal(true);
    }
  }, [mtBalance]);

  // 更新倒计时
  useEffect(() => {
    const interval = setInterval(() => {
      if (nextMintTime >= 0) {
        const currentTime = Math.floor(Date.now() / 1000); // 获取当前时间（秒）
        const remainingTime = nextMintTime - currentTime; // 计算剩余时间
        setTimeLeft(remainingTime > 0 ? remainingTime : 0); // 更新剩余时间
        // console.log("timeLeft", timeLeft)
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

  // 渲染mint按钮
  const renderMintButton = () => {
    if (timeLeft > 0) {
      return <button className="mt-4 px-8 py-3 bg-[#cccccc] text-black text-lg mb-1 rounded-lg hover:text-white">Mint available in: {formatTimeLeft(timeLeft)}</button>;
    }
    return (
      <button 
        onClick={isPending || isConfirming ? null : mintMMI} // 如果正在铸造，禁用按钮
        className={`mt-4 px-8 py-3 ${isPending || isConfirming ? 'bg-gray-500' : 'bg-white'} text-black text-lg mb-1 rounded-lg transition duration-300 flex text-center hover:bg-blue-500 hover:text-white`}
      >
        {isPending || isConfirming ? 'Minting...' : 'Mint MorphMining'}
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
        <h1 className="text-6xl font-bold text-[#4AC8FF] mb-2">MorphMining</h1>
        <p className="text-2xl text-white mb-1">Free Mining for Everyone</p>
        <p className="text-xl text-white mb-1">all is onchain</p>
        {isConnected && (
          <div className='flex flex-col items-center justify-center'>
            <p className="text-3xl text-white mb-1">{mintingEnded ? 'Minting Ended' : 'Minting'}</p>
            <p className="text-white mb-1">Total Supply: {totalSupply !== undefined ? Math.floor(totalSupply)+' MMI' : 'Loading...'}</p>
            <p className="text-white mb-1">Your MMI Balance: {tokenBalance !== undefined ? Math.floor(tokenBalance)+' MMI' : 'Loading...'}</p>
            {renderMintButton()} {/* 调用渲染按钮的函数 */}
          </div>
        )}
        {showSuccessModal && ( // 弹窗显示条件
          <div className="fixed inset-0 flex items-center justify-center bg-opacity-50">
            <div className="bg-[#131336] p-12 rounded-3xl shadow-[0_0_20px_rgba(0,0,0,0.6)]">
              <div className='mx-4'>
                <h2 className="text-white text-3xl mb-2">Minted Amount: {mtBalance} MMI</h2>
                <p className="text-white text-2xl mb-1">
                  Transaction: <a href={`https://explorer.morphl2.io/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Morphscan</a>
                </p>
                <button
                  onClick={() => setShowSuccessModal(false)} 
                  className="mt-4 px-4 py-2 bg-white text-black hover:bg-blue-500 hover:text-white rounded-lg"
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
                MorphMining is an ERC20 token that<br />
                you can mint for free.<br /><br />

                Each phase has its own mining multiplier.<br />
                The base mining value is a random<br />
                amount between 1 and 50 MMI<br /><br />

                In Phase 1, the mining output ranges<br />
                from 10 to 500 MMI per mint.<br /><br />

                Another random factor is the cooldown time,<br />
                which is independent of the phase and varies<br />
                from 5 to 60 minutes.<br /><br />

                Each phase lasts 3 days.<br /><br />

                31.10.2024 - MorphMining started!<br /><br />

                Once Phase 0 is reached, mining will end.<br />
                Fun and educational.<br /><br />

                Contract : <a href={`https://explorer.morphl2.io/address/${wagmiContractConfig.address}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{wagmiContractConfig.address}</a>
            </p>
            <button 
            onClick={() => setShowHelpModal(false)}
            className='bg-white text-black px-4 py-2 mt-4 rounded-xl hover:bg-blue-500 hover:text-white'
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
