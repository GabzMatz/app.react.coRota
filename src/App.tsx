import { useState, useEffect, useCallback } from 'react';
import { RidesList } from './pages/RidesList';
import { SearchPage } from './pages/SearchPage';
import { SearchDestinationPage } from './pages/SearchDestinationPage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { RideDetailsPage } from './pages/RideDetailsPage';
import { BookingPage } from './pages/BookingPage';
import { ProfilePage } from './pages/ProfilePage';
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
import { ToastProvider } from './contexts/ToastContext';
import { authService } from './services/authService';
import { rideService } from './services/rideService';
import { userService } from './services/userService';
import { computeEndTimeFromLeaflet } from './utils/time';
import { useToast } from './contexts/ToastContext';
import type { BookedRide } from './types';
import { RideStatus } from './types';

function AppContent() {
  const { showSuccess, showError } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [authMode, setAuthMode] = useState<'register' | 'login'>('login');
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1);
  const [activeTab, setActiveTab] = useState('search');
  const [currentPage, setCurrentPage] = useState('search');
  const [createStep, setCreateStep] = useState<'departure' | 'destination' | 'route' | 'date' | 'time' | 'passengers' | 'price'>('departure');
  const [selectedRide, setSelectedRide] = useState(null);
  const [searchData, setSearchData] = useState<{ departure: string; passengers: number } | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [bookedRides, setBookedRides] = useState<BookedRide[]>([]);
  const [loadingRideHistory, setLoadingRideHistory] = useState(false);
  const [completedRides, setCompletedRides] = useState<BookedRide[]>([]);
  const [loadingCompletedRides, setLoadingCompletedRides] = useState(false);
  // Create flow selections
  const [createDate, setCreateDate] = useState<string | null>(null); // YYYY-MM-DD
  const [createTime, setCreateTime] = useState<string | null>(null); // HH:mm
  const [createSeats, setCreateSeats] = useState<number | null>(null);
  const [editingRideId, setEditingRideId] = useState<string | null>(null);
  const [editInitialDeparture, setEditInitialDeparture] = useState<string>('');
  const [editInitialDestination, setEditInitialDestination] = useState<string>('');
  const [editInitialPrice, setEditInitialPrice] = useState<number | null>(null);
  // price is passed directly to handler; no need to store separately

  const resetCreateFlow = useCallback(() => {
    setCreateStep('departure');
    setCreateDate(null);
    setCreateTime(null);
    setCreateSeats(null);
    setEditingRideId(null);
    setEditInitialDeparture('');
    setEditInitialDestination('');
    setEditInitialPrice(null);
    localStorage.removeItem('selectedAddress');
    localStorage.removeItem('selectedDestination');
  }, []);

  const handleTabChange = (tab: string) => {
    if (tab === 'messages') {
      return;
    }

    setActiveTab(tab);
    if (tab === 'search') {
      setCurrentPage('search');
    } else if (tab === 'create') {
      resetCreateFlow();
      setCurrentPage('create');
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
      if (page === 'search-results' || page === 'search-destination') {
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
    } else if (currentPage === 'search-destination') {
      setCurrentPage('search');
    } else if (currentPage === 'search-results') {
      setCurrentPage('search-destination');
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

  const getDriverId = useCallback(async (): Promise<string> => {
    const userRaw = localStorage.getItem('authUser');
    const cached = userRaw ? JSON.parse(userRaw) : null;
    if (cached?.id) return cached.id as string;
    // Fallback: fetch from API and cache
    const me = await userService.getMe();
    localStorage.setItem('authUser', JSON.stringify({ id: me.id, email: me.email }));
    return me.id;
  }, []);

  // Função auxiliar para fazer reverse geocoding usando Photon
  const reverseGeocode = useCallback(async (lat: number, lon: number): Promise<string> => {
    try {
      const response = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}`);
      if (!response.ok) {
        return 'Endereço não disponível';
      }
      const data = await response.json();
      const props = data?.features?.[0]?.properties;
      if (!props) {
        return 'Endereço não disponível';
      }
      
      // Montar endereço a partir das propriedades
      const parts = [];
      if (props.name) parts.push(props.name);
      if (props.street) parts.push(props.street);
      if (props.housenumber) parts.push(props.housenumber);
      if (props.city) parts.push(props.city);
      if (props.state) parts.push(props.state);
      
      return parts.length > 0 ? parts.join(', ') : 'Endereço não disponível';
    } catch (error) {
      console.error('Erro no reverse geocoding:', error);
      return 'Endereço não disponível';
    }
  }, []);

  const fetchRideHistory = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      setLoadingRideHistory(true);
      const userId = await getDriverId();
      const history = await rideService.getRideHistory(userId);

      // Converter timestamp do Firestore para data
      const convertFirestoreTimestamp = (ts: { _seconds: number; _nanoseconds: number }) => {
        return new Date(ts._seconds * 1000 + ts._nanoseconds / 1000000);
      };

      // Formatar data
      const formatDate = (dateObj: { _seconds: number; _nanoseconds: number } | string) => {
        let date: Date;
        if (typeof dateObj === 'object' && '_seconds' in dateObj) {
          date = convertFirestoreTimestamp(dateObj);
        } else {
          date = new Date(dateObj as string);
        }
        return date.toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        });
      };

      // Formatar preço
      const formatPrice = (price: number) => {
        return `R$ ${price.toFixed(2).replace('.', ',')}`;
      };

      // Buscar dados de todos os motoristas únicos primeiro
      const uniqueDriverIds = [...new Set(history.map((item: any) => item.ride.driverId).filter(Boolean))];
      
      const driverDataPromises = uniqueDriverIds.map(async (driverId) => {
        try {
          const driverData = await userService.getUserById(driverId);
          return { driverId, driverData };
        } catch (error) {
          console.error(`Erro ao buscar motorista ${driverId}:`, error);
          return { driverId, driverData: null };
        }
      });

      const driverDataResults = await Promise.all(driverDataPromises);
      
      // Criar um mapa de driverId -> driverData para acesso rápido
      const driverMap = new Map(
        driverDataResults
          .filter(result => result.driverData)
          .map(result => [result.driverId, result.driverData])
      );

      // Transformar dados da API para o formato esperado
      const transformedRidesPromises = history.map(async (item: any) => {
        const ride = item.ride;
        
        // Usar startTime e endTime se disponíveis, senão usar time
        const departureTime = ride.startTime || ride.time || '--:--';
        const arrivalTime = ride.endTime || '--:--';

        // Fazer reverse geocoding para obter endereços
        const [departureAddress, arrivalAddress] = await Promise.all([
          reverseGeocode(ride.departureLatLng[0], ride.departureLatLng[1]),
          reverseGeocode(ride.destinationLatLng[0], ride.destinationLatLng[1])
        ]);

        // Obter timestamp da data da corrida para ordenação
        let sortDateTimestamp: number;
        if (ride.date && typeof ride.date === 'object' && '_seconds' in ride.date) {
          sortDateTimestamp = ride.date._seconds * 1000 + (ride.date._nanoseconds || 0) / 1000000;
        } else if (ride.date) {
          sortDateTimestamp = new Date(ride.date as string).getTime();
        } else {
          // Fallback para data de criação se não houver data da corrida
          const createdAt = item.createdAt;
          if (createdAt && typeof createdAt === 'object' && '_seconds' in createdAt) {
            sortDateTimestamp = createdAt._seconds * 1000 + (createdAt._nanoseconds || 0) / 1000000;
          } else {
            sortDateTimestamp = new Date().getTime();
          }
        }

        // Buscar dados do motorista
        const driverData = driverMap.get(ride.driverId);
        const driverName = driverData 
          ? `${driverData.firstName} ${driverData.lastName}`.trim()
          : `Motorista ${ride.driverId?.substring(0, 6) || 'N/A'}`;

        return {
          id: item.id || item.rideId,
          rideDetails: {
            id: ride.id,
            departureTime,
            arrivalTime,
            date: formatDate(ride.date),
            price: formatPrice(ride.pricePerPassenger),
            driverName,
            driverPhoto: null,
            driverRating: '4.5',
            departureLocation: 'Origem',
            departureAddress,
            arrivalLocation: 'Destino',
            arrivalAddress,
            maxPassengers: ride.allSeats,
            availableSeats: ride.availableSeats
          },
          searchData: {
            departure: 'Origem',
            passengers: ride.allSeats - ride.availableSeats
          },
          bookingDate: formatDate(item.createdAt),
          status: item.status || 'pending',
          role: item.role as 'driver' | 'passenger',
          sortDate: sortDateTimestamp
        };
      });

      const transformedRides = await Promise.all(transformedRidesPromises);
      setBookedRides(transformedRides);
    } catch (error) {
      console.error('Erro ao carregar histórico de corridas:', error);
    } finally {
      setLoadingRideHistory(false);
    }
  }, [getDriverId, isAuthenticated, reverseGeocode]);

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const booking = bookedRides.find(b => b.id === bookingId);
      if (!booking) {
        showError('Corrida não encontrada.');
        return;
      }

      const userId = await getDriverId();

      if (booking.role === 'driver') {
        await rideService.cancelAsDriver(booking.rideDetails.id, userId);
      } else if (booking.role === 'passenger') {
        await rideService.cancelAsPassenger(booking.rideDetails.id, userId);
      }

      await fetchRideHistory();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao cancelar corrida.';
      showError(message);
    }
  };

  // Carregar histórico de corridas quando a aba "routes" for ativada
  useEffect(() => {
    if (activeTab === 'routes') {
      fetchRideHistory();
    } else {
      setLoadingRideHistory(false);
    }
  }, [activeTab, fetchRideHistory]);

  // Carregar as 3 últimas corridas concluídas para exibir na tela inicial
  useEffect(() => {
    const loadCompletedRides = async () => {
      if ((activeTab === 'search' || currentPage === 'search') && isAuthenticated) {
        try {
          setLoadingCompletedRides(true);
          const userId = await getDriverId();
          const history = await rideService.getRideHistory(userId);
          
          // Converter timestamp do Firestore para data
          const convertFirestoreTimestamp = (ts: { _seconds: number; _nanoseconds: number }) => {
            return new Date(ts._seconds * 1000 + ts._nanoseconds / 1000000);
          };

          // Formatar data
          const formatDate = (dateObj: { _seconds: number; _nanoseconds: number } | string) => {
            let date: Date;
            if (typeof dateObj === 'object' && '_seconds' in dateObj) {
              date = convertFirestoreTimestamp(dateObj);
            } else {
              date = new Date(dateObj as string);
            }
            return date.toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: 'long',
              year: 'numeric' 
            });
          };

          // Filtrar apenas corridas concluídas
          const completedItems = history.filter((item: any) => 
            item.status === 'completed' || item.status === RideStatus.COMPLETED
          );

          // Buscar dados de todos os motoristas únicos primeiro
          const uniqueDriverIds = [...new Set(completedItems.map((item: any) => item.ride.driverId).filter(Boolean))];
          
          const driverDataPromises = uniqueDriverIds.map(async (driverId) => {
            try {
              const driverData = await userService.getUserById(driverId);
              return { driverId, driverData };
            } catch (error) {
              console.error(`Erro ao buscar motorista ${driverId}:`, error);
              return { driverId, driverData: null };
            }
          });

          const driverDataResults = await Promise.all(driverDataPromises);
          
          // Criar um mapa de driverId -> driverData para acesso rápido
          const driverMap = new Map(
            driverDataResults
              .filter(result => result.driverData)
              .map(result => [result.driverId, result.driverData])
          );

          // Transformar dados da API para o formato esperado
          const transformedRidesPromises = completedItems.map(async (item: any) => {
            const ride = item.ride;
            
            // Fazer reverse geocoding para obter endereços
            const [departureAddress, arrivalAddress] = await Promise.all([
              reverseGeocode(ride.departureLatLng[0], ride.departureLatLng[1]),
              reverseGeocode(ride.destinationLatLng[0], ride.destinationLatLng[1])
            ]);

            // Obter timestamp da data da corrida para ordenação
            let sortDateTimestamp: number;
            if (ride.date && typeof ride.date === 'object' && '_seconds' in ride.date) {
              sortDateTimestamp = ride.date._seconds * 1000 + (ride.date._nanoseconds || 0) / 1000000;
            } else if (ride.date) {
              sortDateTimestamp = new Date(ride.date as string).getTime();
            } else {
              const createdAt = item.createdAt;
              if (createdAt && typeof createdAt === 'object' && '_seconds' in createdAt) {
                sortDateTimestamp = createdAt._seconds * 1000 + (createdAt._nanoseconds || 0) / 1000000;
              } else {
                sortDateTimestamp = new Date().getTime();
              }
            }

            // Buscar dados do motorista
            const driverData = driverMap.get(ride.driverId);
            const driverName = driverData 
              ? `${driverData.firstName} ${driverData.lastName}`.trim()
              : `Motorista ${ride.driverId?.substring(0, 6) || 'N/A'}`;

            return {
              id: item.id || item.rideId,
              rideDetails: {
                id: ride.id,
                departureTime: ride.startTime || ride.time || '--:--',
                arrivalTime: ride.endTime || '--:--',
                date: formatDate(ride.date),
                price: `R$ ${ride.pricePerPassenger.toFixed(2).replace('.', ',')}`,
                driverName,
                driverPhoto: null,
                driverRating: '4.5',
                departureLocation: 'Origem',
                departureAddress,
                arrivalLocation: 'Destino',
                arrivalAddress,
                maxPassengers: ride.allSeats,
                availableSeats: ride.availableSeats
              },
              searchData: {
                departure: departureAddress,
                passengers: ride.allSeats - ride.availableSeats
              },
              bookingDate: formatDate(item.createdAt),
              status: item.status || 'pending',
              role: item.role as 'driver' | 'passenger',
              sortDate: sortDateTimestamp
            };
          });

          const transformedRides = await Promise.all(transformedRidesPromises);
          
          // Ordenar por data (mais recente primeiro) e pegar apenas as 3 primeiras
          const sortedRides = transformedRides.sort((a, b) => {
            const dateA = a.sortDate || 0;
            const dateB = b.sortDate || 0;
            return dateB - dateA; // Ordem decrescente (mais recente primeiro)
          });
          
          const top3Rides = sortedRides.slice(0, 3);
          setCompletedRides(top3Rides);
        } catch (error) {
          console.error('Erro ao carregar corridas concluídas:', error);
          setCompletedRides([]);
        } finally {
          setLoadingCompletedRides(false);
        }
      } else {
        setCompletedRides([]);
        setLoadingCompletedRides(false);
      }
    };

    loadCompletedRides();
  }, [activeTab, currentPage, isAuthenticated, getDriverId, reverseGeocode]);

  const handleEditRide = async (rideId: string) => {
    try {
      // Buscar dados da corrida
      const rideData = await rideService.getRideById(rideId);
      setEditingRideId(rideId);

      // Converter timestamp do Firestore para data se necessário
      let rideDate: Date;
      if (rideData.date && typeof rideData.date === 'object' && '_seconds' in rideData.date) {
        rideDate = new Date(rideData.date._seconds * 1000);
      } else {
        rideDate = new Date(rideData.date);
      }

      // Formatar data para YYYY-MM-DD
      const year = rideDate.getFullYear();
      const month = String(rideDate.getMonth() + 1).padStart(2, '0');
      const day = String(rideDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      // Fazer reverse geocoding para obter endereços
      const [departureAddress, destinationAddress] = await Promise.all([
        reverseGeocode(rideData.departureLatLng[0], rideData.departureLatLng[1]),
        reverseGeocode(rideData.destinationLatLng[0], rideData.destinationLatLng[1])
      ]);

      // Salvar coordenadas no localStorage
      localStorage.setItem('selectedAddress', JSON.stringify({
        latitude: rideData.departureLatLng[0],
        longitude: rideData.departureLatLng[1],
        address: departureAddress
      }));

      localStorage.setItem('selectedDestination', JSON.stringify({
        latitude: rideData.destinationLatLng[0],
        longitude: rideData.destinationLatLng[1],
        address: destinationAddress
      }));

      // Preencher estados do fluxo de criação
      setCreateDate(formattedDate);
      setCreateTime(rideData.startTime || rideData.time || '');
      setCreateSeats(rideData.allSeats || rideData.availableSeats || 1);
      setEditInitialDeparture(departureAddress);
      setEditInitialDestination(destinationAddress);
      setEditInitialPrice(rideData.pricePerPassenger || null);

      // Navegar para o fluxo de criação na primeira etapa
      setCreateStep('departure');
      setActiveTab('create');
    } catch (error) {
      console.error('Erro ao carregar dados da corrida:', error);
      showError('Erro ao carregar dados da corrida para edição');
    }
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

      // Verificar se está editando ou criando
      if (editingRideId) {
        await rideService.updateRide(editingRideId, payload);
        showSuccess('Carona atualizada com sucesso!');
      } else {
        await rideService.createRide(payload);
        showSuccess('Carona criada com sucesso!');
      }

      // Reset create flow
      resetCreateFlow();
      setActiveTab('routes');
      setCurrentPage('search');
    } catch (e) {
      const msg = e instanceof Error ? e.message : editingRideId ? 'Erro ao atualizar carona' : 'Erro ao criar carona';
      showError(msg);
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
              onComplete={() => {
                setAuthMode('login');
                setRegisterStep(1);
              }} 
              onBack={() => setRegisterStep(2)}
            />
          )
        ) : (
          <LoginPage 
            onLoginSuccess={() => {
              setIsAuthenticated(true);
              // Redirecionar para a tela de busca (início)
              setActiveTab('search');
              setCurrentPage('search');
            }} 
            onRegisterClick={() => {
              setAuthMode('register');
              setRegisterStep(1);
            }}
            onForgotPasswordClick={() => {
              // TODO: Implementar a lógica de recuperação de senha
              console.log('Esqueceu a senha clicado');
            }}
          />
        )
      ) : (
        <>
          {activeTab === 'search' && currentPage === 'search' && <SearchPage onTabChange={handleTabChange} onPageChange={handlePageChange} completedRides={completedRides} isLoadingRecentRides={loadingCompletedRides} />}
          {activeTab === 'search' && currentPage === 'search-destination' && <SearchDestinationPage onTabChange={handleTabChange} onBack={() => setCurrentPage('search')} onContinue={(rides) => { const departure = localStorage.getItem('searchDeparture'); const passengers = localStorage.getItem('searchPassengers'); setSearchData({ departure: departure || '', passengers: parseInt(passengers || '1') }); setSearchResults(rides); setCurrentPage('search-results'); }} searchData={searchData || undefined} />}
          {activeTab === 'search' && currentPage === 'search-results' && <SearchResultsPage rides={searchResults} onTabChange={handleTabChange} onPageChange={handlePageChange} />}
          {activeTab === 'search' && currentPage === 'ride-details' && selectedRide && <RideDetailsPage rideDetails={selectedRide} onTabChange={handleTabChange} onBack={handleBack} onPageChange={handlePageChange} />}
          {activeTab === 'search' && currentPage === 'booking' && selectedRide && <BookingPage rideDetails={selectedRide} searchData={searchData || undefined} onTabChange={handleTabChange} onBack={handleBack} onConfirmBooking={handleConfirmBooking} />}
          {activeTab === 'create' && createStep === 'departure' && <CreatePage onTabChange={handleTabChange} onStepChange={handleCreateStepChange} initialDeparture={editInitialDeparture} isEditing={Boolean(editingRideId)} />}
          {activeTab === 'create' && createStep === 'destination' && <CreateDestinationPage onTabChange={handleTabChange} onBack={handleCreateBack} onStepChange={handleCreateStepChange} initialDestination={editInitialDestination} />}
          {activeTab === 'create' && createStep === 'route' && <RouteSelectedPage onTabChange={handleTabChange} onBack={handleCreateBack} onNavigateToDateSelection={() => setCreateStep('date')} />}
          {activeTab === 'create' && createStep === 'date' && <DateSelectionPage onTabChange={handleTabChange} onBack={handleCreateBack} onDateSelected={(d) => { const yyyy = d.getFullYear(); const mm = String(d.getMonth() + 1).padStart(2, '0'); const dd = String(d.getDate()).padStart(2, '0'); setCreateDate(`${yyyy}-${mm}-${dd}`); setCreateStep('time'); }} initialDate={createDate || undefined} isEditing={Boolean(editingRideId)} />}
          {activeTab === 'create' && createStep === 'time' && <TimeSelectionPage onTabChange={handleTabChange} onBack={handleCreateBack} onTimeSelected={(t) => { setCreateTime(t); setCreateStep('passengers'); }} initialTime={createTime || undefined} />}
          {activeTab === 'create' && createStep === 'passengers' && <PassengerSelectionPage onTabChange={handleTabChange} onBack={handleCreateBack} onPassengerSelected={(count) => { setCreateSeats(count); setCreateStep('price'); }} initialCount={createSeats || undefined} />}
          {activeTab === 'create' && createStep === 'price' && <PriceSelectionPage onTabChange={handleTabChange} onBack={handleCreateBack} onPriceSelected={(price) => { handleCreateRide(price); }} initialPrice={editInitialPrice || undefined} />}
          {activeTab === 'routes' && <RidesList onTabChange={handleTabChange} bookedRides={bookedRides} onCancelBooking={handleCancelBooking} onEditRide={handleEditRide} isLoading={loadingRideHistory} />}
          {activeTab === 'profile' && <ProfilePage onTabChange={handleTabChange} onLogout={() => setIsAuthenticated(false)} />}
          {/* Adicione outras abas conforme necessário */}
        </>
        )}
      </RegisterProvider>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
