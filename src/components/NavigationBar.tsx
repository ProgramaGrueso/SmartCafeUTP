import React from 'react';
import { Home, Sparkles, Map, Package, Bike, User } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import type { RouteType } from '../context/AppStateContext';

export const NavigationBar: React.FC = () => {
  const { currentRoute, setRoute } = useAppState();

  const navItems = [
    { id: 'dashboard' as RouteType, label: 'Inicio', icon: Home },
    { id: 'ai-chat' as RouteType, label: 'Samira', icon: Sparkles },
    { id: 'map' as RouteType, label: 'Mapa', icon: Map },
    { id: 'stock' as RouteType, label: 'Stock', icon: Package },
    { id: 'delivery' as RouteType, label: 'Delivery', icon: Bike },
    { id: 'profile' as RouteType, label: 'Perfil', icon: User },
  ];

  // We only show navigation on main pages. We hide on special flow states if they are full-screen, 
  // but showing it on all these 6 main tabs is standard.
  const isMainRoute = navItems.some(item => item.id === currentRoute);
  if (!isMainRoute && currentRoute !== 'qr-scan' && currentRoute !== 'order-confirmation' && currentRoute !== 'order-tracking' && currentRoute !== 'feedback') {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.03)] max-w-md mx-auto">
      <div className="grid grid-cols-6 items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setRoute(item.id)}
              className="flex flex-col items-center justify-center py-1 transition-all active:scale-90"
            >
              <div
                className={`relative p-1 rounded-full transition-colors ${
                  isActive
                    ? 'text-[#E86B6B]'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon size={20} className={isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'} />
                {item.id === 'ai-chat' && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-[#EC4899] rounded-full border border-white animate-pulse" />
                )}
              </div>
              <span
                className={`text-[10px] mt-0.5 font-medium transition-colors ${
                  isActive ? 'text-[#E86B6B] font-bold' : 'text-gray-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default NavigationBar;
