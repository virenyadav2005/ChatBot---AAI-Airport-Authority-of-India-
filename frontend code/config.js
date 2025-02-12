export const config = {
    googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY',
    mapSettings: {
        zoom: 17,
        center: {
            lat: 28.5562,
            lng: 77.1000
        }
    },
    apiEndpoints: {
        flights: '/api/flights',
        crowd: '/api/crowd',
        chat: '/api/chat'
    },
    LOCATION_UPDATE_INTERVAL: 5000,
    LOCATION_ACCURACY: 10,
    MAP_ZOOM_LEVEL: 18
}; 