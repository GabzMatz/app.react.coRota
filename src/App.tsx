import { useState } from 'react';
import { RidesList } from './pages/RidesList';
import { SearchPage } from './pages/SearchPage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { RideDetailsPage } from './pages/RideDetailsPage';
import { BookingPage } from './pages/BookingPage';
import { CreatePage } from './pages/CreatePage';
import { CreateDestinationPage } from './pages/CreateDestinationPage';
import { RouteSelectedPage } from './pages/RouteSelectedPage';
import { DateSelectionPage } from './pages/DateSelectionPage';
import { TimeSelectionPage } from './pages/TimeSelectionPage';
import { PassengerSelectionPage } from './pages/PassengerSelectionPage';
import { PriceSelectionPage } from './pages/PriceSelectionPage';
import RegisterPage from './pages/RegisterPage';
import RegisterStep2Page from './pages/RegisterStep2Page';
import RegisterStep3Page from './pages/RegisterStep3Page';
import LoginPage from './pages/LoginPage';
import { RegisterProvider } from './contexts/RegisterContext';
import { authService } from './services/authService';
import { rideService } from './services/rideService';
import { userService } from './services/userService';
import { computeEndTimeFromLeaflet } from './utils/time';
import type { BookedRide } from './types';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [authMode, setAuthMode] = useState<'register' | 'login'>('login');
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1);
  const [activeTab, setActiveTab] = useState('search');
  const [currentPage, setCurrentPage] = useState('search');
  const [createStep, setCreateStep] = useState<'departure' | 'destination' | 'route' | 'date' | 'time' | 'passengers' | 'price'>('departure');
  const [selectedRide, setSelectedRide] = useState(null);
  const [searchData, setSearchData] = useState<{ departure: string; passengers: number } | null>(null);
  const [bookedRides, setBookedRides] = useState<BookedRide[]>([]);
  // Create flow selections
  const [createDate, setCreateDate] = useState<string | null>(null); // YYYY-MM-DD
  const [createTime, setCreateTime] = useState<string | null>(null); // HH:mm
  const [createSeats, setCreateSeats] = useState<number | null>(null);
  // price is passed directly to handler; no need to store separately

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'search') {
      setCurrentPage('search');
    } else if (tab === 'create') {
      setCurrentPage('create');
      setCreateStep('departure'); // Sempre começar com a tela de partida
    }
  };

  const handleCreateStepChange = (step: 'departure' | 'destination' | 'route' | 'date' | 'time' | 'passengers' | 'price') => {
    setCreateStep(step);
  };

  const handleCreateBack = () => {
    if (createStep === 'price') {
      setCreateStep('passengers');
    } else if (createStep === 'passengers') {
      setCreateStep('time');
    } else if (createStep === 'time') {
      setCreateStep('date');
    } else if (createStep === 'date') {
      setCreateStep('route');
    } else if (createStep === 'route') {
      setCreateStep('destination');
    } else if (createStep === 'destination') {
      setCreateStep('departure');
    }
  };

  const handlePageChange = (page: string, data?: any) => {
    setCurrentPage(page);
    if (data) {
      if (page === 'search-results') {
        setSearchData(data);
      } else {
        setSelectedRide(data);
      }
    }
  };

  const handleBack = () => {
    if (currentPage === 'ride-details') {
      setCurrentPage('search-results');
    } else if (currentPage === 'booking') {
      setCurrentPage('ride-details');
    }
  };

  const handleConfirmBooking = (rideDetails: any, searchData: { departure: string; passengers: number }) => {
    const newBooking: BookedRide = {
      id: Date.now().toString(),
      rideDetails,
      searchData,
      bookingDate: new Date().toISOString(),
      status: 'confirmed'
    };
    
    setBookedRides(prev => [...prev, newBooking]);
    
    // Voltar para a aba de rotas após confirmar
    setActiveTab('routes');
    setCurrentPage('search');
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookedRides(prev => 
      prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'cancelled' as const }
          : booking
      )
    );
  };

  const getDriverId = async (): Promise<string> => {
    const userRaw = localStorage.getItem('authUser');
    const cached = userRaw ? JSON.parse(userRaw) : null;
    if (cached?.id) return cached.id as string;
    // Fallback: fetch from API and cache
    const me = await userService.getMe();
    localStorage.setItem('authUser', JSON.stringify({ id: me.id, email: me.email }));
    return me.id;
  };

  const handleCreateRide = async (price: number) => {
    try {
      // Ensure driver id
      const driverId = await getDriverId();

      // Read coordinates
      const departureRaw = localStorage.getItem('selectedAddress');
      const destinationRaw = localStorage.getItem('selectedDestination');
      if (!departureRaw || !destinationRaw) {
        throw new Error('Coordenadas de partida/destino não encontradas.');
      }
      if (!createDate || !createTime || !createSeats) {
        throw new Error('Data, horário ou lugares não definidos.');
      }

      const departure = JSON.parse(departureRaw);
      const destination = JSON.parse(destinationRaw);

      // endTime somado à duração aproximada do Leaflet
      const endTime = computeEndTimeFromLeaflet(createTime);

      const payload = {
        driverId,
        departureLatLng: [Number(departure.latitude), Number(departure.longitude)] as [number, number],
        destinationLatLng: [Number(destination.latitude), Number(destination.longitude)] as [number, number],
        date: createDate,
        startTime: createTime,
        endTime,
        allSeats: createSeats,
        pricePerPassenger: price,
        passengerIds: [] as string[]
      };

      await rideService.createRide(payload);
      alert('Carona criada com sucesso!');

      // Reset create flow
      setCreateStep('departure');
      setCreateDate(null);
      setCreateTime(null);
      setCreateSeats(null);
      setActiveTab('routes');
      setCurrentPage('search');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao criar carona';
      alert(msg);
    }
  };

  return (
    <RegisterProvider>
      {/* Se não estiver autenticado, mostrar página de autenticação */}
      {!isAuthenticated ? (
        authMode === 'register' ? (
          registerStep === 1 ? (
            <RegisterPage 
              onRegisterSuccess={() => setRegisterStep(2)} 
              onLoginClick={() => setAuthMode('login')}
            />
          ) : registerStep === 2 ? (
            <RegisterStep2Page 
              onNext={() => setRegisterStep(3)} 
              onBack={() => setRegisterStep(1)}
            />
          ) : (
            <RegisterStep3Page 
              onComplete={() => setIsAuthenticated(true)} 
              onBack={() => setRegisterStep(2)}
            />
          )
        ) : (
          <LoginPage 
            onLoginSuccess={() => setIsAuthenticated(true)} 
            onRegisterClick={() => {
              setAuthMode('register');
              setRegisterStep(1);
            }}
            onForgotPasswordClick={() => {
              // Aqui você pode implementar a lógica de recuperação de senha
              console.log('Esqueceu a senha clicado');
            }}
          />
        )
      ) : (
        <>
          {activeTab === 'search' && currentPage === 'search' && <SearchPage onTabChange={handleTabChange} onPageChange={handlePageChange} />}
          {activeTab === 'search' && currentPage === 'search-results' && <SearchResultsPage onTabChange={handleTabChange} onPageChange={handlePageChange} />}
          {activeTab === 'search' && currentPage === 'ride-details' && selectedRide && <RideDetailsPage rideDetails={selectedRide} onTabChange={handleTabChange} onBack={handleBack} onPageChange={handlePageChange} />}
          {activeTab === 'search' && currentPage === 'booking' && selectedRide && <BookingPage rideDetails={selectedRide} searchData={searchData} onTabChange={handleTabChange} onBack={handleBack} onConfirmBooking={handleConfirmBooking} />}
          {activeTab === 'create' && createStep === 'departure' && <CreatePage onTabChange={handleTabChange} onStepChange={handleCreateStepChange} />}
          {activeTab === 'create' && createStep === 'destination' && <CreateDestinationPage onTabChange={handleTabChange} onBack={handleCreateBack} onStepChange={handleCreateStepChange} />}
          {activeTab === 'create' && createStep === 'route' && <RouteSelectedPage onTabChange={handleTabChange} onBack={handleCreateBack} onNavigateToDateSelection={() => setCreateStep('date')} />}
          {activeTab === 'create' && createStep === 'date' && <DateSelectionPage onTabChange={handleTabChange} onBack={handleCreateBack} onDateSelected={(d) => { const yyyy = d.getFullYear(); const mm = String(d.getMonth() + 1).padStart(2, '0'); const dd = String(d.getDate()).padStart(2, '0'); setCreateDate(`${yyyy}-${mm}-${dd}`); setCreateStep('time'); }} />}
          {activeTab === 'create' && createStep === 'time' && <TimeSelectionPage onTabChange={handleTabChange} onBack={handleCreateBack} onTimeSelected={(t) => { setCreateTime(t); setCreateStep('passengers'); }} />}
          {activeTab === 'create' && createStep === 'passengers' && <PassengerSelectionPage onTabChange={handleTabChange} onBack={handleCreateBack} onPassengerSelected={(count) => { setCreateSeats(count); setCreateStep('price'); }} />}
          {activeTab === 'create' && createStep === 'price' && <PriceSelectionPage onTabChange={handleTabChange} onBack={handleCreateBack} onPriceSelected={(price) => { handleCreateRide(price); }} />}
          {activeTab === 'routes' && <RidesList onTabChange={handleTabChange} bookedRides={bookedRides} onCancelBooking={handleCancelBooking} />}
          {/* Adicione outras abas conforme necessário */}
        </>
      )}
    </RegisterProvider>
  );
}

export default App;
