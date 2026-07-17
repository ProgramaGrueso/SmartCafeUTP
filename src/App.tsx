import React from 'react';
import { AppStateProvider, useAppState } from './context/AppStateContext';
import NavigationBar from './components/NavigationBar';
import VoiceButton from './components/VoiceButton';
import Dashboard from './pages/Dashboard';
import AIChat from './pages/AIChat';
import CafeteriaMap from './pages/CafeteriaMap';
import StockStatus from './pages/StockStatus';
import Delivery from './pages/Delivery';
import Profile from './pages/Profile';
import QRScanner from './pages/QRScanner';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderTracking from './pages/OrderTracking';
import Feedback from './pages/Feedback';

const PageRouter: React.FC = () => {
  const { currentRoute } = useAppState();

  switch (currentRoute) {
    case 'dashboard':
      return <Dashboard />;
    case 'ai-chat':
      return <AIChat />;
    case 'map':
      return <CafeteriaMap />;
    case 'stock':
      return <StockStatus />;
    case 'delivery':
      return <Delivery />;
    case 'profile':
      return <Profile />;
    case 'qr-scan':
      return <QRScanner />;
    case 'order-confirmation':
      return <OrderConfirmation />;
    case 'order-tracking':
      return <OrderTracking />;
    case 'feedback':
      return <Feedback />;
    default:
      return <Dashboard />;
  }
};

function AppContent() {
  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-gray-50 shadow-2xl relative flex flex-col border-x border-gray-150 overflow-hidden">
      <PageRouter />
      <VoiceButton />
      <NavigationBar />
    </div>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  );
}
