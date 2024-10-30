import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import WalletConnect from './WalletConnect';
import BaseMeme from './BaseMeme'; 
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  base,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";


const config = getDefaultConfig({
  appName: 'basememe',
  projectId: '76641386b896e258eb94f6c6bbc6942b',
  chains: [base],
  ssr: false, 
});

const queryClient = new QueryClient();
const App = () => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider initialChain={base}>
          <Router>
          <div className="min-h-screen">
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
