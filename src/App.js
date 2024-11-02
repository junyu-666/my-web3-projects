import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import BaseMeme from './BaseMeme'; 
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  Chain,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider, http } from 'wagmi';
import {
  base,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react"

// 自定义morph网络
const Morph = {
  id: 2818, // 链ID
  name: 'Morph', // 链的名称
  rpcUrls: {
    default: {
      http : ['https://rpc.morphl2.io']
    }, // 链的 RPC URL
  },
  nativeCurrency: {
    name: 'Ether', // 代币名称
    symbol: 'ETH', // 代币符号
    decimals: 18, // 代币小数位数
  },
};

const config = getDefaultConfig({
  appName: 'basememe',
  projectId: '76641386b896e258eb94f6c6bbc6942b',
  chains: [Morph]
});

const queryClient = new QueryClient();
const App = () => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <Router>
          <div className="min-h-screen">
            <Analytics />
            <Routes>
              <Route path="/" element={<BaseMeme />} />
            </Routes>
          </div>
          </Router>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;
