import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, TextField, MenuItem, Chip, Alert, CircularProgress, List, ListItem, ListItemText } from '@mui/material';
import { MapPin, Navigation, TrendingUp, RefreshCw } from 'lucide-react';
import TransportService from '../../services/transportService';

const LiveTracking = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBus, setSelectedBus] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadLocations();
    const interval = autoRefresh ? setInterval(loadLocations, 10000) : null;
    return () => { if (interval) clearInterval(interval); };
  }, [autoRefresh]);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const result = await TransportService.getLiveLocations();
      if (!result.success) throw new Error(result.error);
      setLocations(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBusSelect = (bus) => {
    setSelectedBus(selectedBus?.bus_id === bus.bus_id ? null : bus);
  };

  if (loading && locations.length === 0) {
    return <Box className="flex items-center justify-center min-h-screen"><CircularProgress /></Box>;
  }

  return (
    <Box className="p-6 space-y-6">
      <Box className="flex justify-between items-center">
        <Box>
          <Typography variant="h4" className="font-bold mb-2">Live Tracking</Typography>
          <Typography variant="body1" color="text.secondary">Real-time bus location tracking</Typography>
        </Box>
        <Box className="flex gap-2">
          <Button variant={autoRefresh ? 'contained' : 'outlined'}
            onClick={() => setAutoRefresh(!autoRefresh)}
            startIcon={<RefreshCw size={20} className={autoRefresh ? 'animate-spin' : ''} />}>
            Auto Refresh
          </Button>
          <Button variant="contained" onClick={loadLocations}
            className="bg-blue-600 hover:bg-blue-700">Refresh Now</Button>
        </Box>
      </Box>

      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

      <Alert severity="info" icon={<MapPin size={20} />}>
        <strong>Note:</strong> Live tracking uses GPS data. Map visualization requires Mapbox/Google Maps integration.
        Once Supabase tables are connected, real-time location updates will be available.
      </Alert>

      <Box className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Box className="lg:col-span-2">
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-4">Active Buses</Typography>
              <Box className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {locations.map((bus) => (
                  <Card key={bus.bus_id} className={`cursor-pointer transition-all ${
                    selectedBus?.bus_id === bus.bus_id ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
                  }`} onClick={() => handleBusSelect(bus)}>
                    <CardContent className="p-4">
                      <Box className="flex items-center justify-between mb-2">
                        <Typography variant="h6" className="font-bold">{bus.bus_number}</Typography>
                        <Chip label={bus.status} size="small"
                          color={bus.status === 'Moving' ? 'success' : 'warning'} />
                      </Box>
                      <Box className="space-y-1">
                        <Box className="flex items-center text-sm text-gray-600">
                          <MapPin size={16} className="mr-2" />
                          <Typography variant="body2">Route: {bus.route_id}</Typography>
                        </Box>
                        <Box className="flex items-center text-sm text-gray-600">
                          <TrendingUp size={16} className="mr-2" />
                          <Typography variant="body2">Speed: {bus.speed} km/h</Typography>
                        </Box>
                        <Box className="flex items-center text-sm text-gray-600">
                          <Navigation size={16} className="mr-2" />
                          <Typography variant="body2">
                            Lat: {bus.latitude.toFixed(4)}, Lng: {bus.longitude.toFixed(4)}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Driver: {bus.driver_name}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-4">Selected Bus Details</Typography>
              {selectedBus ? (
                <Box className="space-y-4">
                  <Box className="p-4 bg-blue-50 rounded-lg">
                    <Typography variant="h5" className="font-bold mb-2">{selectedBus.bus_number}</Typography>
                    <Chip label={selectedBus.status} color={selectedBus.status === 'Moving' ? 'success' : 'warning'} />
                  </Box>
                  <Box className="space-y-2">
                    <Box>
                      <Typography variant="body2" color="text.secondary">Route</Typography>
                      <Typography variant="body1" className="font-medium">{selectedBus.route_id}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Driver</Typography>
                      <Typography variant="body1" className="font-medium">{selectedBus.driver_name}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Current Speed</Typography>
                      <Typography variant="body1" className="font-medium">{selectedBus.speed} km/h</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Location</Typography>
                      <Typography variant="body2" className="font-mono">
                        {selectedBus.latitude.toFixed(6)}, {selectedBus.longitude.toFixed(6)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Last Update</Typography>
                      <Typography variant="body2">
                        {new Date(selectedBus.last_update).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Button variant="contained" fullWidth className="bg-blue-600 hover:bg-blue-700"
                    startIcon={<MapPin size={20} />}>
                    View on Map
                  </Button>
                </Box>
              ) : (
                <Box className="text-center py-8">
                  <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
                  <Typography variant="body1" color="text.secondary">
                    Select a bus to view details
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardContent>
              <Typography variant="h6" className="mb-4">Quick Stats</Typography>
              <Box className="space-y-3">
                <Box className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <Typography variant="body2">Moving</Typography>
                  <Typography variant="h6" className="font-bold text-green-600">
                    {locations.filter(b => b.status === 'Moving').length}
                  </Typography>
                </Box>
                <Box className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <Typography variant="body2">Stopped</Typography>
                  <Typography variant="h6" className="font-bold text-orange-600">
                    {locations.filter(b => b.status === 'Stopped').length}
                  </Typography>
                </Box>
                <Box className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <Typography variant="body2">Total Buses</Typography>
                  <Typography variant="h6" className="font-bold text-blue-600">{locations.length}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default LiveTracking;