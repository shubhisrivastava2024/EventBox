import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Toast } from './components/Toast';
import { AuthModal } from './components/AuthModal';
import { EventCatalog } from './pages/EventCatalog';
import { EventDetail } from './pages/EventDetail';
import { Checkout } from './pages/Checkout';
import { TicketScanner } from './pages/TicketScanner';
import { SupportDashboard } from './pages/SupportDashboard';
import { MyTickets } from './pages/MyTickets';
import { AdminDashboard } from './pages/AdminDashboard';

const MainApp = () => {
  const [activeTab, setActiveTab] = useState('catalog');
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [checkoutData, setCheckoutData] = useState(null);
  const [toast, setToast] = useState(null);

  const { isAuthModalOpen, closeAuthModal, authModalTab } = useAuth();

  const triggerToast = (toastObj) => {
    setToast(toastObj);
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const handleSelectEvent = (eventId) => {
    setSelectedEventId(eventId);
    setActiveTab('detail');
  };

  const handleProceedToCheckout = (event, selectedSeats) => {
    setCheckoutData({ event, selectedSeats });
    setActiveTab('checkout');
  };

  const handleRoleSwitched = (targetTab) => {
    if (targetTab) {
      setActiveTab(targetTab);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-['Inter',sans-serif]">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'catalog' && (
          <EventCatalog onSelectEvent={handleSelectEvent} />
        )}

        {activeTab === 'detail' && selectedEventId && (
          <EventDetail
            eventId={selectedEventId}
            onBack={() => setActiveTab('catalog')}
            onProceedToCheckout={handleProceedToCheckout}
            setToast={triggerToast}
          />
        )}

        {activeTab === 'checkout' && checkoutData && (
          <Checkout
            checkoutData={checkoutData}
            onBack={() => setActiveTab('detail')}
            onBookingSuccess={() => setActiveTab('my-tickets')}
            setToast={triggerToast}
          />
        )}

        {activeTab === 'scanner' && (
          <TicketScanner setToast={triggerToast} />
        )}

        {activeTab === 'support' && (
          <SupportDashboard setToast={triggerToast} />
        )}

        {activeTab === 'my-tickets' && (
          <MyTickets setToast={triggerToast} />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            setToast={triggerToast}
            onEventCreated={() => setActiveTab('catalog')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>Online Event Ticket Booking Platform • Built for 3-Day Hackathon with Role Access (Customer, Entry Manager, Admin, Support, Organizer)</p>
      </footer>

      {/* Global Auth Modal for Login, Sign Up, and 5-Role Portals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        defaultTab={authModalTab}
        onRoleSwitched={handleRoleSwitched}
        setToast={triggerToast}
      />

      {/* Global Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
