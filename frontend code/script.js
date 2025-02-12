// Remove config import and use API key directly
const GOOGLE_MAPS_API_KEY = 'AIzaSyAZfY8QIrw-DTKt6n9F8U0D5YcVDmrUXzo';

// Open Chatbot
const openChat = () => {
  console.log('Opening chat...');
  document.getElementById('chatbot').style.display = 'block';
  document.querySelector('.overlay').style.display = 'block';
};

//open Crowd Status
const openCrowdStatus = () => {
    console.log('Opening crowd status ...');
    document.getElementById('crowd-monitor-modal').style.display = 'block';
    document.querySelector('.overlay').style.display = 'block';
  };

// Open Navigation Section
const openNavigation = () => {
  console.log('Opening navigation...');
  const navigationModal = document.getElementById('navigation-modal');
  const overlay = document.querySelector('.overlay');
  
  if (navigationModal && overlay) {
    navigationModal.style.display = 'block';
    overlay.style.display = 'block';
    
    // Initialize map only if not already initialized
    if (!window.map) {
      setTimeout(initMap, 100);
    }
  }
};

// Close Navigation Section
const closeNavigation = () => {
  console.log('Closing navigation...');
  document.getElementById('navigation-modal').style.display = 'none';
  document.querySelector('.overlay').style.display = 'none';
};

// Close Chatbot
const closeChat = () => {
  console.log('Closing chat...');
  document.getElementById('chatbot').style.display = 'none';
  document.querySelector('.overlay').style.display = 'none';
};

//close Crowd Status
const closeCrowdStatus = () => {
  console.log('Closing crowd status...');
  document.getElementById('crowd-monitor-modal').style.display = 'none';
  document.querySelector('.overlay').style.display = 'none';
};

// Add these new features at the beginning of the file
let currentLanguage = 'en';
let recognition = null;
const MAX_MESSAGE_LENGTH = 500;

// Initialize Speech Recognition
function initSpeechRecognition() {
  if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = currentLanguage;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      document.getElementById('user-input').value = transcript;
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      alert('Speech recognition failed. Please try again.');
    };
  }
}

// Initialize chat with welcome message
function initChat() {
  const chatBody = document.getElementById('chat-body');
  const welcomeMessage = getWelcomeMessage(currentLanguage);
  addMessage('bot', welcomeMessage);
}

// Language-specific welcome messages
const welcomeMessages = {
  en: "Hello! How can I assist you today?",
  hi: "नमस्ते! मैं आपकी कैसे मदद कर सकता हूं?",
  ta: "வணக்கம்! நான் உங்களுக்கு எப்படி உதவ முடியும்?",
  // Add more languages as needed
};

function getWelcomeMessage(lang) {
  return welcomeMessages[lang] || welcomeMessages.en;
}

// Add message to chat
function addMessage(type, text) {
  const chatBody = document.getElementById('chat-body');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}-message`;
  messageDiv.textContent = text;
  chatBody.appendChild(messageDiv);
  chatBody.scrollTop = chatBody.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
  document.querySelector('.typing-indicator').style.display = 'flex';
}

function hideTypingIndicator() {
  document.querySelector('.typing-indicator').style.display = 'none';
}

// Update character count
document.getElementById('user-input').addEventListener('input', (e) => {
  const count = e.target.value.length;
  document.querySelector('.character-count').textContent = `${count}/${MAX_MESSAGE_LENGTH}`;
  
  if (count > MAX_MESSAGE_LENGTH) {
    e.target.value = e.target.value.substring(0, MAX_MESSAGE_LENGTH);
  }
});

// Voice input handler
document.getElementById('voice-input').addEventListener('click', () => {
  if (recognition) {
    recognition.start();
  } else {
    alert('Speech recognition is not supported in your browser.');
  }
});

// Language change handler
document.getElementById('chatbot-language').addEventListener('change', (e) => {
  currentLanguage = e.target.value;
  if (recognition) {
    recognition.lang = currentLanguage;
  }
  // Update placeholder text based on language
  updatePlaceholders(currentLanguage);
});

// API Manager with proper error handling
class APIManager {
    async makeRequest(endpoint, data) {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',  // Make sure server accepts POST requests
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Request Error:', {
                error: error.message,
                context: 'send-message',
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            });
            
            // Show user-friendly error message
            showErrorMessage('Unable to send message. Please try again.');
            throw error;
        }
    }
}

// Error message display function
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    // Remove error message after 3 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// Update the send message handler
async function handleSendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    
    if (!message) return;
    
    try {
        const apiManager = new APIManager();
        await apiManager.makeRequest('/api/send-message', { message });
        
        // Clear input after successful send
        userInput.value = '';
        
    } catch (error) {
        // Error is already handled in APIManager
        console.log('Message send failed:', error.message);
    }
}

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, setting up event listeners...');
    
    // Chat buttons
    document.getElementById('open-chat')?.addEventListener('click', openChat);
    document.getElementById('close-chat')?.addEventListener('click', closeChat);

    // Crowd Status buttons
    document.getElementById('open-crowd')?.addEventListener('click', openCrowdStatus);
    document.getElementById('close-crowd-monitor')?.addEventListener('click', closeCrowdStatus);
    
    // Navigation buttons
    document.getElementById('open-navigation')?.addEventListener('click', openNavigation);
    document.getElementById('close-navigation')?.addEventListener('click', closeNavigation);
    
    // Overlay click handler
    document.querySelector('.overlay')?.addEventListener('click', () => {
        document.getElementById('chatbot').style.display = 'none';
        document.getElementById('navigation-modal').style.display = 'none';
        document.getElementById('crowd-monitor-modal').style.display = 'none';
        document.querySelector('.overlay').style.display = 'none';
    });

    // Debug log to check if elements exist
    console.log('Elements found:', {   
        openChat: document.getElementById('open-chat'),
        closeChat: document.getElementById('close-chat'),
        openNav: document.getElementById('open-navigation'),
        closeNav: document.getElementById('close-navigation'),
        openCrowd: document.getElementById('open-crowd'),
        closeCrowd: document.getElementById('close-crowd-monitor'), 
        overlay: document.querySelector('.overlay')
    });

    // Initialize other features
    initSpeechRecognition();
    initChat();
    initMap();
    initializeSearch();
    initializeFloorControls();
    
    // Initialize help and directory buttons
    document.querySelectorAll('.nav-button').forEach(button => {
      button.addEventListener('click', () => {
        const action = button.querySelector('i').classList.contains('fa-info-circle') ? 'help' : 'directory';
        handleNavAction(action);
      });
    });

    // Add event listener for send button
    document.getElementById('send-message')?.addEventListener('click', handleSendMessage);

    // Initialize search input
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent form submission
            }
        });
    }

    // Debug logging
    console.log('DOM Elements:', {
        map: document.getElementById('map'),
        searchInput: document.querySelector('.search-input'),
        navigationModal: document.getElementById('navigation-modal')
    });

    // Initialize quick filters
    initializeQuickFilters();

    // Add event listener for main language selector
    const mainLanguageSelect = document.getElementById('main-language');
    if (mainLanguageSelect) {
        mainLanguageSelect.addEventListener('change', async (e) => {
            const selectedLang = e.target.value;
            // Sync language across all selectors
            document.getElementById('chatbot-language').value = selectedLang;
            document.getElementById('nav-language').value = selectedLang;
            // Translate content
            await TranslationSystem.translateMainPage(selectedLang);
        });
    }

    // Flight Updates button
    document.getElementById('open-flights')?.addEventListener('click', openFlightUpdates);
    document.getElementById('close-flights')?.addEventListener('click', closeFlightUpdates);

    // Flight Updates Modal Event Handlers
    const openFlightsBtn = document.getElementById('open-flights');
    const closeFlightsBtn = document.getElementById('close-flights');
    const flightsModal = document.getElementById('flight-updates-modal');
    const overlay = document.querySelector('.overlay');

    openFlightsBtn?.addEventListener('click', () => {
        console.log('Opening flight updates modal');
        flightsModal.style.display = 'block';
        overlay.style.display = 'block';
        // Initialize flight updates
        FlightUpdates.init();
    });

    closeFlightsBtn?.addEventListener('click', () => {
        console.log('Closing flight updates modal');
        flightsModal.style.display = 'none';
        overlay.style.display = 'none';
    });

    // Close modal when clicking overlay
    overlay?.addEventListener('click', () => {
        flightsModal.style.display = 'none';
        overlay.style.display = 'none';
    });

    // For testing - trigger flight updates
    setTimeout(() => {
        FlightUpdates.loadTestData();
    }, 1000);

    // Add Crowd Monitoring Event Handlers
    document.addEventListener('DOMContentLoaded', () => {
        // ... existing code ...

        // Crowd monitoring buttons
        const openCrowdBtn = document.getElementById('open-crowd');
        const closeCrowdBtn = document.getElementById('close-crowd-monitor');
        const crowdModal = document.getElementById('crowd-monitor-modal');
        const overlay = document.querySelector('.overlay');

        openCrowdBtn?.addEventListener('click', () => {
            crowdModal.style.display = 'block';
            overlay.style.display = 'block';
            CrowdMonitor.init(); // Initialize crowd monitoring
        });

        closeCrowdBtn?.addEventListener('click', () => {
            crowdModal.style.display = 'none';
            overlay.style.display = 'none';
        });

        // Close on overlay click
        overlay?.addEventListener('click', () => {
            crowdModal.style.display = 'none';
        });
    });
});

function handleNavAction(action) {
  switch(action) {
    case 'help':
      showHelpModal();
      break;
    case 'directory':
      showDirectoryModal();
      break;
  }
}

function showHelpModal() {
  // Implementation coming soon
  console.log('Help modal will be implemented');
}

function showDirectoryModal() {
  // Implementation coming soon
  console.log('Directory modal will be implemented');
}

// State Management
const AppState = {
    state: {
        map: null,
        activeFloor: 'L1',
        markers: [],
        currentLanguage: 'en',
        currentRequest: null
    },
    listeners: new Map(),
    
    setState(key, value) {
        this.state[key] = value;
        this.notifyListeners(key);
    },
    
    getState(key) {
        return this.state[key];
    },
    
    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);
    },
    
    notifyListeners(key) {
        if (this.listeners.has(key)) {
            this.listeners.get(key).forEach(callback => callback(this.state[key]));
        }
    }
};

// Error Handler
const ErrorHandler = {
    handle(error, context) {
        console.error(`Error in ${context}:`, error);
        this.showErrorToUser(error);
        this.logError(error, context);
    },
    
    showErrorToUser(error) {
        const message = this.getUserFriendlyMessage(error);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    },
    
    getUserFriendlyMessage(error) {
        // Map technical errors to user-friendly messages
        const errorMessages = {
            'NetworkError': 'Unable to connect to the server. Please check your internet connection.',
            'AbortError': 'Request was cancelled.',
            'default': 'An unexpected error occurred. Please try again.'
        };
        
        return errorMessages[error.name] || errorMessages.default;
    },
    
    logError(error, context) {
        // Here you would typically send to a logging service
        console.log('Logging error:', {
            error: error.message,
            context,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        });
    }
};

// Event Handlers
const EventHandlers = {
    init() {
        this.cleanup();
        this.setupListeners();
    },
    
    cleanup() {
        // Remove existing listeners
        const elements = ['open-chat', 'close-chat', 'send-message', 'voice-input'];
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.replaceWith(element.cloneNode(true));
            }
        });
    },
    
    setupListeners() {
        // Chat handlers
        document.getElementById('open-chat')?.addEventListener('click', openChat);
        document.getElementById('close-chat')?.addEventListener('click', closeChat);

        // Voice input handler with error handling
        document.getElementById('voice-input')?.addEventListener('click', () => {
            try {
                if (recognition) {
                    recognition.start();
                } else {
                    throw new Error('Speech recognition not supported');
                }
            } catch (error) {
                ErrorHandler.handle(error, 'voice-input');
            }
        });

        // Send message handler with API manager
        const apiManager = new APIManager();
        document.getElementById('send-message')?.addEventListener('click', async () => {
            const userInput = document.getElementById('user-input');
            const message = userInput.value.trim();
            
            if (!message) return;
            
            try {
                addMessage('user', message);
                userInput.value = '';
                document.querySelector('.character-count').textContent = `0/${MAX_MESSAGE_LENGTH}`;
                
                showTypingIndicator();
                
                const response = await apiManager.makeRequest('/api/chat', {
                    message,
                    language: AppState.getState('currentLanguage')
                });
                
                hideTypingIndicator();
                addMessage('bot', response.message);
            } catch (error) {
                ErrorHandler.handle(error, 'send-message');
                hideTypingIndicator();
                addMessage('bot', 'Sorry, there was an error processing your request.');
            }
        });
    }
};

// Utility Functions
const Utils = {
    debounce(fn, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn(...args), delay);
        };
    },
    
    throttle(fn, limit) {
        let inThrottle;
        return (...args) => {
            if (!inThrottle) {
                fn(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// Navigation related event handlers
const NavigationHandlers = {
    init() {
        // Navigation button handlers
        const openNavBtn = document.getElementById('open-navigation');
        const closeNavBtn = document.getElementById('close-navigation');
        const navModal = document.getElementById('navigation-modal');
        const overlay = document.querySelector('.overlay');

        if (openNavBtn) {
            openNavBtn.addEventListener('click', openNavigation);
        }

        if (closeNavBtn) {
            closeNavBtn.addEventListener('click', closeNavigation);
        }

        // Close modal when clicking overlay
        if (overlay) {
            overlay.addEventListener('click', () => {
                if (navModal) {
                    navModal.style.display = 'none';
                    overlay.style.display = 'none';
                }
            });
        }

        // Initialize quick filters
        this.initializeQuickFilters();
    },

    initializeQuickFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filterType = button.dataset.filter;
                this.handleFilter(filterType);
            });
        });
    },

    handleFilter(filterType) {
        console.log(`Filtering for: ${filterType}`);
        // Add your filter logic here
    }
};

// Update your DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('Initializing application...');
        
        // Initialize all handlers
        EventHandlers.init();
        NavigationHandlers.init();
        
        // Initialize other features
        initSpeechRecognition();
        initChat();
        
        // Subscribe to language changes
        AppState.subscribe('currentLanguage', (newLanguage) => {
            if (recognition) {
                recognition.lang = newLanguage;
            }
            updatePlaceholders(newLanguage);
        });
        
    } catch (error) {
        ErrorHandler.handle(error, 'initialization');
    }
});

// Add debugging
function addDebugListeners() {
    const navButton = document.getElementById('open-navigation');
    if (navButton) {
        console.log('Navigation button found');
        navButton.addEventListener('click', () => {
            console.log('Navigation button clicked');
        });
    } else {
        console.error('Navigation button not found');
    }
}

// Call this in your DOMContentLoaded event
addDebugListeners();

// Map initialization
function initMap() {
    try {
        // Check if Google Maps API is loaded
        if (!window.google || !window.google.maps) {
            throw new Error('Google Maps API not loaded');
        }

        const mapContainer = document.getElementById('map');
        if (!mapContainer) {
            throw new Error('Map container not found');
        }

        const mapOptions = {
            center: { lat: 28.5563, lng: 77.1000 },
            zoom: 19,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            fullscreenControl: true,
            streetViewControl: true,
            mapTypeControl: true,
            styles: [
                {
                    featureType: "poi",
                    elementType: "labels",
                    stylers: [{ visibility: "off" }]
                }
            ]
        };
        
        // Create the map instance
        window.map = new google.maps.Map(mapContainer, mapOptions);
        
        // Add loading indicator
        mapContainer.insertAdjacentHTML('beforeend', '<div class="map-loading">Loading map...</div>');
        
        // Wait for map to be fully loaded
        google.maps.event.addListenerOnce(window.map, 'tilesloaded', () => {
            // Remove loading indicator
            const loadingElement = document.querySelector('.map-loading');
            if (loadingElement) {
                loadingElement.remove();
            }
            
            // Initialize features after map is loaded
            initializeSearch();
            addAirportMarkers();
            initializeFloorControls();
        });

    } catch (error) {
        console.error('Map initialization error:', error);
        showMapError();
    }
}

// Show map error UI
function showMapError() {
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        mapContainer.innerHTML = `
            <div class="map-error">
                <i class="fas fa-map-marked-alt"></i>
                <p>Unable to load map</p>
                <button onclick="retryLoadMap()" class="retry-btn">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

// Add this function definition
function retryLoadMap() {
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        mapContainer.innerHTML = '';
        
        // Show loading state
        mapContainer.innerHTML = '<div class="loading">Loading map...</div>';
        
        // Retry initialization
        setTimeout(() => {
            try {
        initMap();
            } catch (error) {
                console.error('Retry failed:', error);
                showMapError();
            }
        }, 1000);
    }
}

// Update locations with more spread out coordinates
const airportInternalLocations = {
    'G': {
        foodCourt: [
            {
                id: 'fc-g-1',
                name: 'Central Food Court',
                location: 'Main Terminal',
                type: 'food',
                description: 'Multi-cuisine food court',
                coordinates: { lat: 28.5563, lng: 77.1000 }
            },
            {
                id: 'fc-g-2',
                name: 'West Wing Café',
                location: 'West Terminal',
                type: 'food',
                description: 'Coffee and snacks',
                coordinates: { lat: 28.5565, lng: 77.0995 }
            },
            {
                id: 'fc-g-3',
                name: 'East Food Plaza',
                location: 'East Terminal',
                type: 'food',
                description: 'International cuisine',
                coordinates: { lat: 28.5562, lng: 77.1005 }
            }
        ],
        restrooms: [
            {
                id: 'rest-g-1',
                name: 'North Restroom',
                location: 'North Wing',
                type: 'restroom',
                coordinates: { lat: 28.5568, lng: 77.1000 }
            },
            {
                id: 'rest-g-2',
                name: 'South Restroom',
                location: 'South Wing',
                type: 'restroom',
                coordinates: { lat: 28.5558, lng: 77.1000 }
            },
            {
                id: 'rest-g-3',
                name: 'East Restroom',
                location: 'East Wing',
                type: 'restroom',
                coordinates: { lat: 28.5563, lng: 77.1008 }
            },
            {
                id: 'rest-g-4',
                name: 'West Restroom',
                location: 'West Wing',
                type: 'restroom',
                coordinates: { lat: 28.5563, lng: 77.0992 }
            }
        ],
        shopping: [
            {
                id: 'shop-g-1',
                name: 'North Mall',
                location: 'North Terminal',
                type: 'shopping',
                coordinates: { lat: 28.5570, lng: 77.1002 }
            },
            {
                id: 'shop-g-2',
                name: 'South Market',
                location: 'South Terminal',
                type: 'shopping',
                coordinates: { lat: 28.5556, lng: 77.0998 }
            },
            {
                id: 'shop-g-3',
                name: 'East Shopping',
                location: 'East Wing',
                type: 'shopping',
                coordinates: { lat: 28.5564, lng: 77.1010 }
            },
            {
                id: 'shop-g-4',
                name: 'West Retail',
                location: 'West Wing',
                type: 'shopping',
                coordinates: { lat: 28.5562, lng: 77.0990 }
            }
        ],
        gates: [
            {
                id: 'gate-g-1',
                name: 'North Gate',
                location: 'North Exit',
                type: 'gates',
                coordinates: { lat: 28.5572, lng: 77.1000 }
            },
            {
                id: 'gate-g-2',
                name: 'South Gate',
                location: 'South Exit',
                type: 'gates',
                coordinates: { lat: 28.5554, lng: 77.1000 }
            },
            {
                id: 'gate-g-3',
                name: 'East Gate',
                location: 'East Exit',
                type: 'gates',
                coordinates: { lat: 28.5563, lng: 77.1012 }
            },
            {
                id: 'gate-g-4',
                name: 'West Gate',
                location: 'West Exit',
                type: 'gates',
                coordinates: { lat: 28.5563, lng: 77.0988 }
            }
        ]
    },
    'L1': {
        foodCourt: [
            {
                id: 'fc-l1-1',
                name: 'First Floor Restaurant',
                location: 'North Wing',
                type: 'food',
                description: 'Fine dining',
                coordinates: { lat: 28.5568, lng: 77.1005 }
            }
        ],
        restrooms: [
            {
                id: 'rest-l1-1',
                name: 'First Floor Restroom',
                location: 'Near Escalator',
                type: 'restroom',
                coordinates: { lat: 28.5569, lng: 77.1006 }
            }
        ],
        shopping: [
            {
                id: 'shop-l1-1',
                name: 'Duty Free Shop',
                location: 'East Wing',
                type: 'shopping',
                coordinates: { lat: 28.5570, lng: 77.1007 }
            },
            {
                id: 'shop-l1-2',
                name: 'Souvenir Shop',
                location: 'West Wing',
                type: 'shopping',
                coordinates: { lat: 28.5571, lng: 77.1008 }
            }
        ]
    },
    'L2': {
        foodCourt: [
            {
                id: 'fc-l2-1',
                name: 'Rooftop Café',
                location: 'Central Area',
                type: 'food',
                description: 'International cuisine',
                coordinates: { lat: 28.5572, lng: 77.1009 }
            }
        ],
        restrooms: [
            {
                id: 'rest-l2-1',
                name: 'Second Floor Restroom',
                location: 'Near Lounge',
                type: 'restroom',
                coordinates: { lat: 28.5573, lng: 77.1010 }
            }
        ],
        gates: [
            {
                id: 'gate-l2-1',
                name: 'Gate A1',
                location: 'Terminal A',
                type: 'gates',
                coordinates: { lat: 28.5574, lng: 77.1011 }
            },
            {
                id: 'gate-l2-2',
                name: 'Gate B1',
                location: 'Terminal B',
                type: 'gates',
                coordinates: { lat: 28.5575, lng: 77.1012 }
            }
        ]
    }
};

// Add CSS styles for search results
const styles = `
    .search-results-container {
        background: white;
        border-radius: 4px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        max-height: 300px;
        overflow-y: auto;
        position: absolute;
        width: 100%;
        z-index: 1000;
    }

    .search-result-item {
        padding: 10px;
        cursor: pointer;
        border-bottom: 1px solid #eee;
    }

    .search-result-item:hover {
        background: #f5f5f5;
    }

    .floor-header {
        background: #003366;
        color: white;
        padding: 5px 10px;
        font-weight: bold;
    }
`;

// Add styles to document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

// Modified search initialization
function initializeSearch() {
    const searchInput = document.querySelector('.search-input');
    const suggestionsContainer = document.getElementById('search-suggestions');

    if (!searchInput || !suggestionsContainer) {
        console.error('Search elements not found');
        return;
    }

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        // Clear previous results
        suggestionsContainer.innerHTML = '';

        if (searchTerm.length < 2) {
            suggestionsContainer.style.display = 'none';
            return;
        }

        const results = searchAirportLocations(searchTerm);
        if (results.length > 0) {
            displaySearchResults(results, suggestionsContainer);
        } else {
            suggestionsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>कोई परिणाम नहीं मिला</p>
                </div>
            `;
        }
        suggestionsContainer.style.display = 'block';
    });
}

// Modified click handler in displaySearchResults function
function displaySearchResults(results, container) {
    // Group results by floor
    const groupedResults = results.reduce((acc, result) => {
        if (!acc[result.floor]) acc[result.floor] = [];
        acc[result.floor].push(result);
        return acc;
    }, {});

    Object.entries(groupedResults).forEach(([floor, floorResults]) => {
        const floorSection = document.createElement('div');
        floorSection.className = 'floor-section';
        floorSection.innerHTML = `
            <div class="floor-header">
                <i class="fas fa-building"></i>
                <span>Floor ${floor}</span>
            </div>
            ${floorResults.map(result => `
                <div class="result-item" data-floor="${floor}" data-id="${result.id}">
                    <div class="result-icon">
                        <i class="fas ${getIconForType(result.type)}"></i>
                    </div>
                    <div class="result-details">
                        <div class="result-name">${result.name}</div>
                    <div class="result-location">${result.location}</div>
                    </div>
                    <button class="goto-btn" title="Go Here">
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            `).join('')}
        `;

        // Modified click handlers
        floorSection.querySelectorAll('.result-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                const result = floorResults[index];
                
                // Clear search input and hide suggestions
                const searchInput = document.querySelector('.search-input');
                if (searchInput) {
                    searchInput.value = '';
                }
                container.style.display = 'none';
                
                // Switch floor and highlight location
                switchFloor(result.floor);
                highlightLocation(result);
                });
            });

        container.appendChild(floorSection);
    });
}

// Also add click outside to hide suggestions
document.addEventListener('click', (e) => {
    const searchInput = document.querySelector('.search-input');
    const suggestionsContainer = document.getElementById('search-suggestions');
    
    if (searchInput && suggestionsContainer) {
        // If click is outside search area, hide suggestions
        if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            suggestionsContainer.style.display = 'none';
        }
    }
});

// Show suggestions when focusing on search input
document.querySelector('.search-input')?.addEventListener('focus', (e) => {
    const suggestionsContainer = document.getElementById('search-suggestions');
    if (suggestionsContainer && e.target.value.length >= 2) {
        suggestionsContainer.style.display = 'block';
    }
});

// Helper function to get icon for facility type
function getIconForType(type) {
    const icons = {
        food: 'fa-utensils',
        restroom: 'fa-restroom',
        shopping: 'fa-shopping-bag',
        service: 'fa-concierge-bell',
        lounge: 'fa-couch'
    };
    return icons[type] || 'fa-map-marker-alt';
}

// Function to highlight selected location
function highlightLocation(location) {
    // Show all markers first
    filterMarkersByType('all');
    
    // Center map on location
    window.map.setCenter(location.coordinates);
    window.map.setZoom(20);

    // Highlight marker
    window.currentMarkers?.forEach(marker => {
        if (marker.id === location.id) {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(() => marker.setAnimation(null), 2000);
        }
    });
}

// Search through airport locations
function searchAirportLocations(searchTerm) {
    const results = [];

    Object.entries(airportInternalLocations).forEach(([floor, categories]) => {
        Object.entries(categories).forEach(([category, locations]) => {
            locations.forEach(location => {
                if (
                    location.name.toLowerCase().includes(searchTerm) ||
                    category.toLowerCase().includes(searchTerm) ||
                    location.description?.toLowerCase().includes(searchTerm)
                ) {
                    results.push({
                        ...location,
                        floor,
                        category
                    });
                }
            });
        });
    });

    return results;
}

// Update addAirportMarkers function to handle floor visibility
function addAirportMarkers() {
    // Clear existing markers
    if (window.currentMarkers) {
        window.currentMarkers.forEach(marker => marker.setMap(null));
    }
    window.currentMarkers = [];

    // Add markers for each floor
    Object.entries(airportInternalLocations).forEach(([floor, categories]) => {
        Object.entries(categories).forEach(([category, locations]) => {
            locations.forEach(location => {
                const marker = new google.maps.Marker({
                    position: location.coordinates,
                    map: window.map,
                    title: location.name,
            icon: {
                        url: getMarkerIcon(location.type),
                scaledSize: new google.maps.Size(32, 32)
            },
                    floor: floor,
                    id: location.id,
                    type: location.type,  // Make sure type is set
                    visible: floor === currentFloor
                });

                // For debugging
                console.log('Created marker:', {
                    id: location.id,
                    type: location.type,
                    floor: floor
                });

                // Add info window
            const infoWindow = new google.maps.InfoWindow({
                    content: createInfoWindowContent({...location, floor})
                });

            marker.addListener('click', () => {
                    // Close previous info window if any
                    if (currentInfoWindow) {
                        currentInfoWindow.close();
                    }
                    
                infoWindow.open(window.map, marker);
                    currentInfoWindow = infoWindow;
                });

                marker.infoWindow = infoWindow;
                window.currentMarkers.push(marker);
            });
        });
    });
}

// Helper function to get marker icon URL based on type
function getMarkerIcon(type) {
    const icons = {
        food: 'https://maps.google.com/mapfiles/ms/icons/restaurant.png',
        restroom: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        shopping: 'https://maps.google.com/mapfiles/ms/icons/shopping.png',
        service: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
        gates: 'https://maps.google.com/mapfiles/ms/icons/plane.png',
        default: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
    };
    return icons[type] || icons.default;
}

// Update the info window content to include navigation button
function createInfoWindowContent(location) {
    return `
        <div class="info-window">
            <h3>${location.name}</h3>
            <p><strong>Floor:</strong> ${location.floor}</p>
            <p><strong>Location:</strong> ${location.location}</p>
            ${location.description ? `<p>${location.description}</p>` : ''}
            <button onclick="navigateToLocation('${location.id}')" class="nav-to-btn">
                <i class="fas fa-directions"></i> Navigate Here
            </button>
        </div>
    `;
}

// Make navigateToLocation globally available
window.navigateToLocation = navigateToLocation;

// Update switchFloor function to show current floor name
function switchFloor(floor) {
    currentFloor = floor;
    
    // Update floor name display
    const floorNames = {
        'G': 'Ground Floor',
        'L1': 'First Floor',
        'L2': 'Second Floor'
    };
    
    document.querySelectorAll('.floor-btn').forEach(btn => {
        const isActive = btn.dataset.floor === floor;
        btn.classList.toggle('active', isActive);
        if (isActive) {
            btn.setAttribute('aria-label', `Current floor: ${floorNames[floor]}`);
        } else {
            btn.setAttribute('aria-label', `Switch to ${floorNames[btn.dataset.floor]}`);
        }
    });

    // Update markers visibility
    if (window.currentMarkers) {
        window.currentMarkers.forEach(marker => {
            marker.setVisible(marker.floor === floor);
        });
    }
}

// Filter markers by type
function filterMarkers(type) {
    const facilities = document.querySelectorAll('.facility-marker');
    facilities.forEach(facility => {
        if (type === 'all' || facility.dataset.type === type) {
            facility.style.display = 'block';
        } else {
            facility.style.display = 'none';
        }
    });
}

// Define airport facilities with floor information
const airportFacilities = {
    terminals: [
        {
            position: { lat: 28.5563, lng: 77.1000 },
            title: 'Terminal 1',
            floor: 'G',
            type: 'terminal',
            icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        }
    ],
    foodCourts: [
        {
            position: { lat: 28.5565, lng: 77.1002 },
            title: 'Food Court A',
            floor: 'L1',
            type: 'food',
            description: 'Multiple restaurants and cafes',
            icon: 'https://maps.google.com/mapfiles/ms/icons/restaurant.png'
        },
        {
            position: { lat: 28.5568, lng: 77.1005 },
            title: 'Food Court B',
            floor: 'L2',
            type: 'food',
            description: 'International cuisine',
            icon: 'https://maps.google.com/mapfiles/ms/icons/restaurant.png'
        }
    ],
    restrooms: [
        {
            position: { lat: 28.5564, lng: 77.1001 },
            title: 'Restroom Ground Floor',
            floor: 'G',
            type: 'restroom',
            icon: 'https://maps.google.com/mapfiles/ms/icons/toilets.png'
        },
        {
            position: { lat: 28.5566, lng: 77.1003 },
            title: 'Restroom First Floor',
            floor: 'L1',
            type: 'restroom',
            icon: 'https://maps.google.com/mapfiles/ms/icons/toilets.png'
        }
    ],
    shops: [
        {
            position: { lat: 28.5567, lng: 77.1004 },
            title: 'Duty Free Shopping',
            floor: 'L1',
            type: 'shopping',
            description: 'International brands',
            icon: 'https://maps.google.com/mapfiles/ms/icons/shopping.png'
        }
    ]
};

// Store markers by floor
let markersByFloor = {
    'G': [],
    'L1': [],
    'L2': []
};

// Function to add facility markers
function addFacilityMarkers() {
    // Clear existing markers
    Object.values(markersByFloor).forEach(markers => {
        markers.forEach(marker => marker.setMap(null));
    });
    markersByFloor = { 'G': [], 'L1': [], 'L2': [] };

    // Add all facilities
    Object.values(airportFacilities).flat().forEach(facility => {
        const marker = new google.maps.Marker({
            position: facility.position,
            map: window.map,
            title: facility.title,
            icon: facility.icon,
            visible: facility.floor === currentFloor
        });

        // Create detailed info window
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div class="facility-info">
                    <h3>${facility.title}</h3>
                    <p>Floor: ${facility.floor}</p>
                    ${facility.description ? `<p>${facility.description}</p>` : ''}
                    <p>Type: ${facility.type}</p>
                </div>
            `
        });

        marker.addListener('click', () => {
            infoWindow.open(window.map, marker);
        });

        // Store marker reference by floor
        markersByFloor[facility.floor].push(marker);
    });
}

// Track current floor
let currentFloor = 'G';

// Function to filter facilities by type
function filterFacilities(type) {
    const allMarkers = Object.values(markersByFloor).flat();
    
    if (type === 'all') {
        allMarkers.forEach(marker => {
            if (marker.floor === currentFloor) {
                marker.setVisible(true);
            }
        });
        return;
    }

    allMarkers.forEach(marker => {
        const shouldShow = marker.facilityType === type && marker.floor === currentFloor;
        marker.setVisible(shouldShow);
    });
}

// Initialize floor controls with better labels
function initializeFloorControls() {
    const floorControls = document.querySelector('.floor-controls');
    if (floorControls) {
        floorControls.innerHTML = `
            <button class="floor-btn" data-floor="L2" aria-label="Switch to Second Floor">L2</button>
            <button class="floor-btn" data-floor="L1" aria-label="Switch to First Floor">L1</button>
            <button class="floor-btn active" data-floor="G" aria-label="Current floor: Ground Floor">G</button>
        `;
        
        floorControls.querySelectorAll('.floor-btn').forEach(btn => {
            btn.addEventListener('click', () => switchFloor(btn.dataset.floor));
        });
    }
}

// Add these styles to your CSS
const mapStyles = `
    .map-loading {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 10px 20px;
        border-radius: 4px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        z-index: 1;
    }

    #map {
        height: 100%;
        width: 100%;
        position: relative;
    }
`;

// Add styles to document
const mapStyleSheet = document.createElement("style");
mapStyleSheet.innerText = mapStyles;
document.head.appendChild(mapStyleSheet);

// Make sure to call initMap after Google Maps API is loaded
window.initMap = initMap;
// Add these functions for navigation functionality

// Add this global variable at the top
let currentDirectionsRenderer = null;
let currentInfoWindow = null;

// Update the calculateRoute function
function calculateRoute(start, destination) {
    if (currentDirectionsRenderer) {
        currentDirectionsRenderer.setMap(null);
    }

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
        map: window.map,
        suppressMarkers: true,
        polylineOptions: {
            strokeColor: '#003366',
            strokeWeight: 6
        }
    });

    currentDirectionsRenderer = directionsRenderer;

    const request = {
        origin: start,
        destination: destination,
        travelMode: google.maps.TravelMode.WALKING
    };

    directionsService.route(request, async (result, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(result);
            
            const route = result.routes[0].legs[0];
            const currentLang = document.getElementById('nav-language').value;

            // Translate time and distance if not in English
            if (currentLang !== 'en') {
                const translatedTime = await TranslationSystem.translateNavContent(route.duration.text, currentLang);
                const translatedDistance = await TranslationSystem.translateNavContent(route.distance.text, currentLang);
                
                document.getElementById('estimated-time').textContent = translatedTime;
                document.getElementById('distance').textContent = translatedDistance;
                
                // Show translated directions
                await showDirections(route.steps, currentLang);
            } else {
                document.getElementById('estimated-time').textContent = route.duration.text;
                document.getElementById('distance').textContent = route.distance.text;
                await showDirections(route.steps, 'en');
            }
        }
    });
}

// Update the navigateToLocation function
function navigateToLocation(locationId) {
    console.log('Starting navigation to:', locationId);
    const destination = window.currentMarkers.find(m => m.id === locationId);
    if (!destination) {
        console.error('Destination not found');
        return;
    }

    // Close any open info window
    if (currentInfoWindow) {
        currentInfoWindow.close();
    }

    // Get user's current position using geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                // Calculate and display route
                calculateRoute(userLocation, destination.getPosition());
                
                // Update UI elements
                document.getElementById('estimated-time').textContent = 'Calculating...';
                document.getElementById('distance').textContent = 'Calculating...';
                
                // Show navigation panel
                const navigationInfo = document.getElementById('nav-info');
                if (navigationInfo) {
                    navigationInfo.style.display = 'block';
                }
            },
            (error) => {
                console.error('Error getting location:', error);
                alert('Unable to get your current location. Please enable location services.');
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    } else {
        alert('Geolocation is not supported by your browser');
    }
}

// Update showDirections function to include direction symbols
async function showDirections(steps, targetLang = 'en') {
    const directionsPanel = document.getElementById('directions');
    if (!directionsPanel) return;

    // Get direction symbols with correct turn arrows
    const directionSymbols = {
        straight: '⬆️',
        left: '⬅️',      // Changed to left arrow
        right: '➡️',     // Changed to right arrow
        'slight left': '↖️',
        'slight right': '↗️',
        'sharp left': '⬅️',
        'sharp right': '➡️',
        'turn-around': '↩️',
        arrive: '📍'
    };

    // Translate and add symbols to each step
    const translatedSteps = await Promise.all(steps.map(async (step, index) => {
        let instruction = step.instructions.replace(/<[^>]*>/g, '');
        
        // Determine direction symbol
        let symbol = directionSymbols.straight; // Default symbol
        const lowerInstruction = instruction.toLowerCase();
        
        // Check for different types of turns
        if (lowerInstruction.includes('left')) {
            symbol = lowerInstruction.includes('slight') ? directionSymbols['slight left'] : directionSymbols.left;
        } else if (lowerInstruction.includes('right')) {
            symbol = lowerInstruction.includes('slight') ? directionSymbols['slight right'] : directionSymbols.right;
        } else if (lowerInstruction.includes('destination')) {
            symbol = directionSymbols.arrive;
        }

        // Translate if needed
        if (targetLang !== 'en') {
            instruction = await TranslationSystem.translateNavContent(instruction, targetLang);
        }

        return {
            ...step,
            instructions: instruction,
            symbol: symbol,
            distance: {
                ...step.distance,
                text: targetLang !== 'en' ? 
                    await TranslationSystem.translateNavContent(step.distance.text, targetLang) : 
                    step.distance.text
            }
        };
    }));

    // Update UI with translated steps and symbols
    directionsPanel.innerHTML = translatedSteps.map((step, index) => `
        <div class="direction-step">
            <div class="step-number">${index + 1}</div>
            <div class="step-details">
                <div class="instruction">
                    <span class="direction-symbol">${step.symbol}</span>
                    ${step.instructions}
                </div>
                <div class="distance">${step.distance.text}</div>
            </div>
        </div>
    `).join('');
}

// Add these functions for quick filters functionality

// Function to handle filter clicks
function initializeQuickFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Set initial state
    filterButtons.forEach(button => {
        if (button.dataset.filter === 'all') {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
        
        // Add click event listener
        button.addEventListener('click', () => {
            const filterType = button.dataset.filter;
            
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Apply filter
            filterMarkersByType(filterType);
        });
    });
}

// Function to filter markers by type
function filterMarkersByType(type) {
    if (!window.currentMarkers) {
        console.log('No markers found');
        return;
    }
    
    console.log('Filtering markers by type:', type);
    
        window.currentMarkers.forEach(marker => {
        // Only affect markers on current floor
        if (marker.floor === currentFloor) {
            // For "all" type, show all markers on current floor
            if (type === 'all') {
                marker.setVisible(true);
                console.log('Showing all markers on floor:', currentFloor);
            } else {
                // For specific type, show only matching markers
                const isVisible = marker.type === type;
                marker.setVisible(isVisible);
                console.log(`${isVisible ? 'Showing' : 'Hiding'} marker:`, marker.title);
                
                // Close info window if marker is hidden
                if (!isVisible && marker.infoWindow) {
                    marker.infoWindow.close();
                }
            }
        }
    });
}

// Helper function to find location by ID
function findLocationById(id) {
    for (const [floor, categories] of Object.entries(airportInternalLocations)) {
        for (const [category, locations] of Object.entries(categories)) {
            const location = locations.find(loc => loc.id === id);
            if (location) return location;
        }
    }
    return null;
}

// Also add an "All" button if not already present
document.addEventListener('DOMContentLoaded', () => {
    const quickFilters = document.querySelector('.quick-filters');
    if (quickFilters) {
        // Make sure "All" button exists and is first
        if (!quickFilters.querySelector('[data-filter="all"]')) {
            const allButton = document.createElement('button');
            allButton.className = 'filter-btn';
            allButton.dataset.filter = 'all';
            allButton.innerHTML = '<i class="fas fa-globe"></i> All';
            quickFilters.insertBefore(allButton, quickFilters.firstChild);
        }
        
        // Initialize filters
        initializeQuickFilters();
    }
});

// Language Support System
const LanguageSystem = {
    // Current language
    currentLanguage: 'en',
    
    // Available languages (using Google Translate supported languages)
    languages: {
        'en': { name: 'English', nativeName: 'English' },
        'hi': { name: 'Hindi', nativeName: 'हिन्दी' },
        'es': { name: 'Spanish', nativeName: 'Español' },
        'fr': { name: 'French', nativeName: 'Français' },
        'de': { name: 'German', nativeName: 'Deutsch' },
        'ja': { name: 'Japanese', nativeName: '日本語' },
        'ko': { name: 'Korean', nativeName: '한국어' },
        'zh': { name: 'Chinese', nativeName: '中文' },
        'ar': { name: 'Arabic', nativeName: 'العربية' },
        // Add more languages as needed
    },

    // Initialize language system
    init() {
        this.setupLanguageSelector();
        this.loadSavedLanguage();
        this.setupEventListeners();
    },

    // Setup language selector dropdown
    setupLanguageSelector() {
        const dropdown = document.getElementById('language-dropdown');
        if (!dropdown) return;

        dropdown.innerHTML = Object.entries(this.languages)
            .map(([code, lang]) => `
                <div class="language-option" data-lang="${code}">
                    <span class="native-name">${lang.nativeName}</span>
                    <span class="english-name">(${lang.name})</span>
                </div>
            `).join('');
    },

    // Load saved language preference
    loadSavedLanguage() {
        const saved = localStorage.getItem('preferred-language');
        if (saved && this.languages[saved]) {
            this.changeLanguage(saved);
        }
    },

    // Setup event listeners
    setupEventListeners() {
        // Toggle dropdown
        const langBtn = document.getElementById('current-language');
        const dropdown = document.getElementById('language-dropdown');

        langBtn?.addEventListener('click', () => {
            dropdown?.classList.toggle('show');
        });

        // Handle language selection
        dropdown?.addEventListener('click', (e) => {
            const option = e.target.closest('.language-option');
            if (option) {
                const langCode = option.dataset.lang;
                this.changeLanguage(langCode);
                dropdown.classList.remove('show');
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.language-selector')) {
                dropdown?.classList.remove('show');
            }
        });
    },

    // Change language
    async changeLanguage(langCode) {
        if (!this.languages[langCode]) return;

        this.currentLanguage = langCode;
        localStorage.setItem('preferred-language', langCode);
    
    // Update UI
        const currentLangBtn = document.getElementById('current-language');
        if (currentLangBtn) {
            currentLangBtn.querySelector('span').textContent = 
                this.languages[langCode].name;
        }

        // Update all translatable elements
        await this.translatePage();

        // Update active state in dropdown
        document.querySelectorAll('.language-option').forEach(option => {
            option.classList.toggle('active', option.dataset.lang === langCode);
        });

        // Emit language change event
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: langCode }
        }));
    },

    // Translate page content
    async translatePage() {
        const elements = document.querySelectorAll('[data-translate]');
        
        for (const element of elements) {
            const originalText = element.dataset.translate;
            if (this.currentLanguage !== 'en') {
                const translation = await this.getTranslation(originalText);
                element.textContent = translation;
    } else {
                element.textContent = originalText;
            }
        }

        // Also translate dynamic content
        this.translateDynamicContent();
    },

    // Get translation (can be extended to use a translation service)
    async getTranslation(text, targetLang = this.currentLanguage) {
        try {
            const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_MAPS_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    q: text,
                    target: targetLang,
                    source: 'en'
                })
            });

            const data = await response.json();
            if (data.data && data.data.translations) {
                return data.data.translations[0].translatedText;
            }
            return text;
        } catch (error) {
            console.error('Translation error:', error);
            return text;
        }
    },

    // Add function to translate dynamic content
    async translateDynamicContent() {
        // Translate navigation elements
        const navElements = document.querySelectorAll('.nav-button, .chat-button, .cta-button');
        for (const element of navElements) {
            if (this.currentLanguage !== 'en') {
                const translation = await this.getTranslation(element.textContent);
                element.textContent = translation;
            }
        }

        // Translate map markers and info windows
    if (window.currentMarkers) {
            window.currentMarkers.forEach(async marker => {
                if (this.currentLanguage !== 'en') {
                    const translation = await this.getTranslation(marker.getTitle());
                    marker.setTitle(translation);
                }
        });
    }
}
};

// Initialize language system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    LanguageSystem.init();
});

// Add translation functions for chat and navigation windows
const TranslationSystem = {
    // Translation function for chat window
    async translateChatContent(text, targetLang) {
        try {
            const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_MAPS_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    q: text,
                    target: targetLang,
                    source: 'en'
                })
            });

            const data = await response.json();
            return data.data.translations[0].translatedText;
        } catch (error) {
            console.error('Chat translation error:', error);
            return text;
        }
    },

    // Translation function for navigation window
    async translateNavContent(text, targetLang) {
        try {
            const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_MAPS_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    q: text,
                    target: targetLang,
                    source: 'en'
                })
            });

            const data = await response.json();
            return data.data.translations[0].translatedText;
        } catch (error) {
            console.error('Navigation translation error:', error);
            return text;
        }
    },

    // Event handlers for language selection
    initializeTranslation() {
        // Main page language selection
        const mainLanguageSelect = document.getElementById('main-language');
        if (mainLanguageSelect) {
            mainLanguageSelect.addEventListener('change', async (e) => {
                const selectedLang = e.target.value;
                await this.translateMainPage(selectedLang);
                
                // Also update chat and navigation windows if open
                if (document.getElementById('chatbot').style.display === 'block') {
                    await this.translateChatWindow(selectedLang);
                }
                if (document.getElementById('navigation-modal').style.display === 'block') {
                    await this.translateNavWindow(selectedLang);
                }
            });
        }

        // Chat window language selection
        const chatLanguageSelect = document.getElementById('chatbot-language');
        if (chatLanguageSelect) {
            chatLanguageSelect.addEventListener('change', async (e) => {
                const selectedLang = e.target.value;
                await this.translateChatWindow(selectedLang);
            });
        }

        // Navigation window language selection
        const navLanguageSelect = document.getElementById('nav-language');
        if (navLanguageSelect) {
            navLanguageSelect.addEventListener('change', async (e) => {
                const selectedLang = e.target.value;
                await this.translateNavWindow(selectedLang);
            });
        }
    },

    // Translate chat window content
    async translateChatWindow(targetLang) {
        if (targetLang === 'en') {
            this.resetChatTranslation();
        return;
    }

        // Translate chat header
        const chatHeader = document.querySelector('.chat-header h3');
        if (chatHeader) {
            if (!chatHeader.getAttribute('data-original')) {
                chatHeader.setAttribute('data-original', chatHeader.textContent);
            }
            chatHeader.textContent = await this.translateChatContent(chatHeader.getAttribute('data-original'), targetLang);
        }

        // Translate all chat messages
        const messages = document.querySelectorAll('.chat-message');
        for (const message of messages) {
            const originalText = message.getAttribute('data-original') || message.textContent;
            if (!message.getAttribute('data-original')) {
                message.setAttribute('data-original', originalText);
            }
            message.textContent = await this.translateChatContent(originalText, targetLang);
        }

        // Translate input placeholder
        const chatInput = document.querySelector('.chat-input input');
        if (chatInput) {
            const originalPlaceholder = chatInput.getAttribute('data-original-placeholder') || 'Type your message...';
            chatInput.setAttribute('data-original-placeholder', originalPlaceholder);
            const translatedPlaceholder = await this.translateChatContent(originalPlaceholder, targetLang);
            chatInput.placeholder = translatedPlaceholder;
        }

        // Store current chat language
        this.currentChatLanguage = targetLang;
    },

    // Translate navigation window content
    async translateNavWindow(targetLang) {
        if (targetLang === 'en') {
            this.resetNavTranslation();
            return;
        }

        // Translate main title
        const mainTitle = document.querySelector('.modal-header h3');
        if (mainTitle) {
            if (!mainTitle.getAttribute('data-original')) {
                mainTitle.setAttribute('data-original', mainTitle.textContent);
            }
            mainTitle.textContent = await this.translateNavContent(mainTitle.getAttribute('data-original'), targetLang);
        }

        // Translate Start Navigation button
        const startNavBtn = document.querySelector('.start-nav-btn');
        if (startNavBtn) {
            if (!startNavBtn.getAttribute('data-original')) {
                startNavBtn.setAttribute('data-original', 'Start Navigation');
            }
            const translatedText = await this.translateNavContent(startNavBtn.getAttribute('data-original'), targetLang);
            startNavBtn.innerHTML = `<i class="fas fa-walking"></i> ${translatedText}`;
        }

        // Translate filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        for (const button of filterButtons) {
            const originalText = button.getAttribute('data-original') || button.textContent;
            if (!button.getAttribute('data-original')) {
                button.setAttribute('data-original', originalText);
            }
            const translatedText = await this.translateNavContent(originalText, targetLang);
            button.textContent = translatedText;
        }

        // Translate location names and descriptions
        const locationElements = document.querySelectorAll('[data-location-text]');
        for (const element of locationElements) {
            const originalText = element.getAttribute('data-original') || element.textContent;
            if (!element.getAttribute('data-original')) {
                element.setAttribute('data-original', originalText);
            }
            element.textContent = await this.translateNavContent(originalText, targetLang);
        }
    },

    // Reset chat translation to English
    resetChatTranslation() {
        document.querySelectorAll('[data-original]').forEach(element => {
            if (element.closest('.chatbot-container')) {
                element.textContent = element.getAttribute('data-original');
            }
        });
    },

    // Reset navigation translation to English
    resetNavTranslation() {
        document.querySelectorAll('[data-original]').forEach(element => {
            if (element.closest('.navigation-modal')) {
                if (element.classList.contains('start-nav-btn')) {
                    element.innerHTML = `<i class="fas fa-walking"></i> ${element.getAttribute('data-original')}`;
                } else {
                    element.textContent = element.getAttribute('data-original');
                }
            }
        });
    },

    // Add method to translate new chat messages
    async translateNewMessage(message, targetLang = this.currentChatLanguage) {
        if (!message || targetLang === 'en') return message;

        const translatedText = await this.translateChatContent(message, targetLang);
        return translatedText;
    },

    // Update translateMainPage function
    async translateMainPage(targetLang) {
        if (targetLang === 'en') {
            this.resetMainTranslation();
        return;
    }

        // Translate all elements with data-translate attribute
        const translatableElements = document.querySelectorAll('[data-translate]');
        for (const element of translatableElements) {
            const originalText = element.getAttribute('data-translate');
            if (originalText) {
                const translatedText = await this.translateNavContent(originalText, targetLang);
                element.textContent = translatedText;
            }
        }

        // Translate dynamic content
        await this.translateDynamicContent(targetLang);
    },

    // Add new method for dynamic content
    async translateDynamicContent(targetLang) {
        // Translate buttons and links
        const elements = document.querySelectorAll('button, a, h1, h2, h3, p');
        for (const element of elements) {
            if (!element.hasAttribute('data-translate') && element.textContent.trim()) {
                const originalText = element.getAttribute('data-original') || element.textContent;
                if (!element.getAttribute('data-original')) {
                    element.setAttribute('data-original', originalText);
                }
                const translatedText = await this.translateNavContent(originalText, targetLang);
                element.textContent = translatedText;
            }
        }

        // Translate placeholders
        const inputs = document.querySelectorAll('input[placeholder]');
        for (const input of inputs) {
            const originalPlaceholder = input.getAttribute('data-original-placeholder') || input.placeholder;
            if (!input.getAttribute('data-original-placeholder')) {
                input.setAttribute('data-original-placeholder', originalPlaceholder);
            }
            const translatedPlaceholder = await this.translateNavContent(originalPlaceholder, targetLang);
            input.placeholder = translatedPlaceholder;
        }
    },

    // Reset main translation to English
    resetMainTranslation() {
        document.querySelectorAll('[data-original]').forEach(element => {
            if (!element.closest('.chatbot-container') && !element.closest('.navigation-modal')) {
                element.textContent = element.getAttribute('data-original');
            }
        });
    }
};

// Initialize translation system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    TranslationSystem.initializeTranslation();
});

// Update the chat message handling
async function handleNewMessage(message, isUser = true) {
    const currentLang = document.getElementById('chatbot-language').value;
    const chatBody = document.getElementById('chat-body');
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${isUser ? 'user' : 'bot'}`;
    messageElement.setAttribute('data-original', message);
    
    // Translate message if needed
    if (currentLang !== 'en') {
        const translatedMessage = await TranslationSystem.translateNewMessage(message, currentLang);
        messageElement.textContent = translatedMessage;
    } else {
        messageElement.textContent = message;
    }
    
    chatBody.appendChild(messageElement);
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Location Tracking System
const LocationSystem = {
    watchId: null,
    currentPosition: null,
    destination: null,
    
    // Initialize location tracking
    async init() {
        try {
            // Check for geolocation support
            if (!navigator.geolocation) {
                throw new Error('Geolocation is not supported');
            }

            // Request permission and start tracking
            const permission = await this.requestLocationPermission();
            if (permission === 'granted') {
                this.startTracking();
            }
        } catch (error) {
            console.error('Location initialization error:', error);
            this.updateStatus('Location service error');
        }
    },

    // Request location permission
    async requestLocationPermission() {
        try {
            const result = await navigator.permissions.query({ name: 'geolocation' });
            return result.state;
        } catch (error) {
            console.error('Permission request error:', error);
            return 'denied';
        }
    },

    // Start continuous location tracking
    startTracking() {
        const options = {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
        };

        this.watchId = navigator.geolocation.watchPosition(
            position => this.handlePositionUpdate(position),
            error => this.handleLocationError(error),
            options
        );

        this.updateStatus('Tracking active');
    },

    // Handle position updates
    handlePositionUpdate(position) {
        const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };

        // Update marker
        this.updateUserMarker(userLocation);
        
        // Update floor and area
        this.updateFloorAndArea(userLocation);
        
        // Update ETA if destination exists
        if (this.destination) {
            this.updateETA(userLocation);
        }
    },

    // Update user marker on map
    updateUserMarker(position) {
        if (!window.map) return;

        // Remove existing marker if any
        if (this.userMarker) {
            this.userMarker.setMap(null);
        }

        // Create new marker
        this.userMarker = new google.maps.Marker({
            position: position,
            map: window.map,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#4285F4',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2
            },
            title: 'You are here'
        });
    },

    // Update floor based on coordinates and building data
    updateFloorAndArea(position) {
        // Define airport zones (example coordinates - replace with actual airport layout)
        const zones = {
            terminal1: {
                bounds: {
                    north: 28.5562,
                    south: 28.5525,
                    east: 77.1000,
                    west: 77.0900
                },
                areas: {
                    checkin: { name: 'Check-in Area', floor: 'G' },
                    security: { name: 'Security Check', floor: 'L1' },
                    gates: { name: 'Gates Area', floor: 'L2' }
                }
            }
        };

        // Determine current zone and area
        const lat = position.lat;
        const lng = position.lng;
        let currentFloor = '--';
        let currentArea = '--';

        // Check which zone user is in
        for (const [zoneName, zone] of Object.entries(zones)) {
            if (lat <= zone.bounds.north && 
                lat >= zone.bounds.south && 
                lng <= zone.bounds.east && 
                lng >= zone.bounds.west) {
                
                // Determine specific area within zone
                for (const [areaName, area] of Object.entries(zone.areas)) {
                    // Add your area detection logic here
                    // For now, using first area as example
                    currentFloor = area.floor;
                    currentArea = area.name;
                    break;
                }
            }
        }

        // Update UI
        document.getElementById('current-floor').textContent = `Floor: ${currentFloor}`;
        document.getElementById('current-area').textContent = `Area: ${currentArea}`;
    },

    // Enhanced ETA calculation
    updateETA(userLocation) {
        if (!this.destination) return;

        const directionsService = new google.maps.DirectionsService();
        
        directionsService.route({
            origin: userLocation,
            destination: this.destination,
            travelMode: google.maps.TravelMode.WALKING,
            optimizeWaypoints: true
        }, (result, status) => {
            if (status === 'OK') {
                const route = result.routes[0].legs[0];
                const duration = route.duration.text;
                const distance = route.distance.text;
                
                // Update ETA display
                document.getElementById('eta-display').textContent = 
                    `ETA: ${duration} (${distance})`;
                
                // Calculate and update progress bar
                const progress = this.calculateProgress(route);
                const progressBar = document.getElementById('nav-progress');
                if (progressBar) {
                    progressBar.style.width = `${progress}%`;
                }
            }
        });
    },

    // Calculate progress percentage
    calculateProgress(route) {
        const totalDistance = route.distance.value; // in meters
        const remainingDistance = google.maps.geometry.spherical.computeDistanceBetween(
            this.userMarker.getPosition(),
            this.destination
        );
        
        return Math.min(100, Math.max(0, 
            ((totalDistance - remainingDistance) / totalDistance) * 100
        ));
    },

    // Update status display
    updateStatus(message) {
        document.getElementById('tracking-status').textContent = message;
    },

    // Handle location errors
    handleLocationError(error) {
        console.error('Location error:', error);
        this.updateStatus('Location error: ' + error.message);
    },

    // Stop tracking
    stopTracking() {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
        this.updateStatus('Tracking stopped');
    }
};

// Initialize location system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    LocationSystem.init();
});

// Add Smart Suggestions System
const SmartSuggestions = {
    // Store frequently accessed locations
    frequentLocations: new Map(),
    
    // Initialize suggestions system
    init() {
        this.loadFrequentLocations();
        this.setupSearchSuggestions();
    },

    // Load user's frequent locations from localStorage
    loadFrequentLocations() {
        const saved = localStorage.getItem('frequentLocations');
        if (saved) {
            this.frequentLocations = new Map(JSON.parse(saved));
        }
    },

    // Update location frequency
    updateFrequency(locationId) {
        const count = (this.frequentLocations.get(locationId) || 0) + 1;
        this.frequentLocations.set(locationId, count);
        
        // Save to localStorage
        localStorage.setItem('frequentLocations', 
            JSON.stringify(Array.from(this.frequentLocations.entries()))
        );
    },

    // Get smart suggestions based on current context
    getSuggestions(searchTerm = '') {
        const suggestions = [];
        const currentTime = new Date().getHours();

        // Add time-based suggestions
        if (currentTime >= 11 && currentTime <= 15) {
            suggestions.push(...this.getLocationsByType('food'));
        }

        // Add frequently visited locations
        const frequentPlaces = Array.from(this.frequentLocations.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([id]) => this.getLocationById(id))
            .filter(Boolean);
        
        suggestions.push(...frequentPlaces);

        // Add search term based suggestions
        if (searchTerm) {
            const searchResults = this.searchLocations(searchTerm);
            suggestions.push(...searchResults);
        }

        return [...new Set(suggestions)]; // Remove duplicates
    },

    // Setup enhanced search suggestions
    setupSearchSuggestions() {
        const searchInput = document.querySelector('.search-input');
        const suggestionsContainer = document.getElementById('search-suggestions');

        if (!searchInput || !suggestionsContainer) return;

        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.trim().toLowerCase();
            const suggestions = this.getSuggestions(term);
            
            this.displaySuggestions(suggestions, suggestionsContainer);
        });
    },

    // Display suggestions in UI
    displaySuggestions(suggestions, container) {
        if (!suggestions.length) {
            container.innerHTML = '<div class="no-suggestions">कोई सुझाव नहीं मिला</div>';
            return;
        }

        container.innerHTML = suggestions.map(location => `
            <div class="suggestion-item" data-id="${location.id}">
                <div class="suggestion-icon">
                    <i class="fas ${this.getIconForType(location.type)}"></i>
                </div>
                <div class="suggestion-details">
                    <div class="suggestion-name">${location.name}</div>
                    <div class="suggestion-meta">
                        <span>${location.floor} Floor</span>
                        ${location.distance ? `<span>${location.distance}</span>` : ''}
                    </div>
                </div>
            </div>
        `).join('');

        // Add click handlers
        container.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.id;
                this.updateFrequency(id);
                navigateToLocation(id);
            });
        });
    },

    // Helper functions
    getLocationById(id) {
        // Search through airportInternalLocations
        for (const [floor, categories] of Object.entries(airportInternalLocations)) {
            for (const locations of Object.values(categories)) {
                const location = locations.find(loc => loc.id === id);
                if (location) return { ...location, floor };
            }
        }
        return null;
    },

    getLocationsByType(type) {
        const locations = [];
        for (const [floor, categories] of Object.entries(airportInternalLocations)) {
            if (categories[type]) {
                locations.push(...categories[type].map(loc => ({ ...loc, floor })));
            }
        }
        return locations;
    },

    getIconForType(type) {
        const icons = {
            food: 'fa-utensils',
            restroom: 'fa-restroom',
            shopping: 'fa-shopping-bag',
            gates: 'fa-plane'
        };
        return icons[type] || 'fa-map-marker-alt';
    }
};

// Initialize smart suggestions when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    SmartSuggestions.init();
});

// Update FlightUpdates system
const FlightUpdates = {
    // Store flight data
    flights: new Map(),
    
    // Initialize flight updates system
    init() {
        const container = document.getElementById('flight-updates');
        if (!container) {
            console.warn('Flight updates container not found');
            return;
        }
        
        this.updateFlightDisplay();
        this.setupSearch();
        this.loadTestData();
        this.startAutoScroll(); // Add this line
    },
    
    // Load test data
    loadTestData() {
        const testFlights = [
            {
                id: 'AI123',
                number: 'AI123',
                status: 'BOARDING',
                gate: 'A1',
                estimatedTime: '14:30',
                destination: 'Mumbai'
            },
            {
                id: 'UK456',
                number: 'UK456',
                status: 'DELAYED',
                gate: 'B2',
                estimatedTime: '15:45',
                destination: 'Delhi'
            },
            {
                id: 'SG789',
                number: 'SG789',
                status: 'GATE_CHANGE',
                gate: 'C3',
                estimatedTime: '16:15',
                destination: 'Bangalore'
            },
            {
                id: 'IX234',
                number: 'IX234',
                status: 'ON_TIME',
                gate: 'D1',
                estimatedTime: '17:00',
                destination: 'Chennai'
            },
            {
                id: 'AI567',
                number: 'AI567',
                status: 'DELAYED',
                gate: 'A2',
                estimatedTime: '18:30',
                destination: 'Kolkata'
            },
            {
                id: 'UK890',
                number: 'UK890',
                status: 'BOARDING',
                gate: 'B4',
                estimatedTime: '15:15',
                destination: 'Hyderabad'
            },
            {
                id: 'SG345',
                number: 'SG345',
                status: 'GATE_CHANGE',
                gate: 'C5',
                estimatedTime: '16:45',
                destination: 'Pune'
            },
            {
                id: 'IX678',
                number: 'IX678',
                status: 'ON_TIME',
                gate: 'D2',
                estimatedTime: '19:00',
                destination: 'Ahmedabad'
            },
            {
                id: 'AI901',
                number: 'AI901',
                status: 'DELAYED',
                gate: 'A3',
                estimatedTime: '20:15',
                destination: 'Goa'
            },
            {
                id: 'UK234',
                number: 'UK234',
                status: 'BOARDING',
                gate: 'B1',
                estimatedTime: '17:30',
                destination: 'Jaipur'
            },
            {
                id: 'SG567',
                number: 'SG567',
                status: 'ON_TIME',
                gate: 'C2',
                estimatedTime: '18:45',
                destination: 'Lucknow'
            },
            {
                id: 'IX890',
                number: 'IX890',
                status: 'GATE_CHANGE',
                gate: 'D4',
                estimatedTime: '21:00',
                destination: 'Chandigarh'
            },
            {
                id: 'AI432',
                number: 'AI432',
                status: 'DELAYED',
                gate: 'A4',
                estimatedTime: '22:30',
                destination: 'Kochi'
            }
        ];
        
        this.updateFlightData(testFlights);
    },

    // Update flight data
    updateFlightData(newData) {
        newData.forEach(flight => {
            const existingFlight = this.flights.get(flight.id);
            
            if (existingFlight) {
                // Check for important changes
                if (this.hasImportantChanges(existingFlight, flight)) {
                    this.notifyFlightChange(flight);
                }
            }
            
            this.flights.set(flight.id, flight);
        });

        // Update UI
        this.updateFlightDisplay();
    },

    // Check for important changes
    hasImportantChanges(oldFlight, newFlight) {
        return (
            oldFlight.status !== newFlight.status ||
            oldFlight.gate !== newFlight.gate ||
            oldFlight.estimatedTime !== newFlight.estimatedTime
        );
    },

    // Send notification
    notifyFlightChange(flight) {
        const notification = {
            title: `Flight ${flight.number} Update`,
            message: this.getUpdateMessage(flight),
            type: 'flight-update'
        };
        
        NotificationSystem.show(notification);
    },

    // Get update message
    getUpdateMessage(flight) {
        switch (flight.status) {
            case 'DELAYED':
                return `Flight ${flight.number} is delayed. New time: ${flight.estimatedTime}`;
            case 'GATE_CHANGE':
                return `Gate changed for flight ${flight.number}. New gate: ${flight.gate}`;
            case 'BOARDING':
                return `Boarding started for flight ${flight.number} at gate ${flight.gate}`;
            default:
                return `Status update for flight ${flight.number}: ${flight.status}`;
        }
    },

    // Update display
    updateFlightDisplay(flightsToShow = null) {
        const container = document.getElementById('flight-updates');
        if (!container) return;

        const displayFlights = flightsToShow || Array.from(this.flights.values());

        if (displayFlights.length === 0) {
            container.innerHTML = '<div class="no-flights">No flights found</div>';
            return;
        }

        container.innerHTML = displayFlights
            .map(flight => `
                <div class="flight-card ${flight.status.toLowerCase()}">
                    <div class="flight-header">
                        <span class="flight-number">${flight.number}</span>
                        <span class="flight-status">${flight.status}</span>
                    </div>
                    <div class="flight-info">
                        <div class="flight-destination">
                            <i class="fas fa-plane-arrival"></i>
                            ${flight.destination}
                        </div>
                        <div class="flight-time">
                            <i class="fas fa-clock"></i>
                            ${flight.estimatedTime}
                        </div>
                        <div class="flight-gate">
                            <i class="fas fa-door-open"></i>
                            Gate ${flight.gate}
                        </div>
                    </div>
                </div>
            `).join('');
    },

    // Add search functionality
    setupSearch() {
        const searchInput = document.querySelector('.flight-search-input');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            this.filterFlights(searchTerm);
        });
    },

    // Filter flights based on search term
    filterFlights(searchTerm) {
        const filteredFlights = Array.from(this.flights.values()).filter(flight => {
            return (
                flight.number.toLowerCase().includes(searchTerm) ||
                flight.destination.toLowerCase().includes(searchTerm) ||
                flight.gate.toLowerCase().includes(searchTerm) ||
                flight.status.toLowerCase().includes(searchTerm)
            );
        });

        this.updateFlightDisplay(filteredFlights);
    },

    // Add auto-scroll functionality
    startAutoScroll() {
        const container = document.querySelector('.flight-updates-modal .modal-body');
        if (!container) return;

        let scrollAmount = 0;
        const scrollSpeed = 0.5; // Reduced speed for smoother scrolling
        
        const scroll = () => {
            scrollAmount += scrollSpeed;
            container.scrollTop = scrollAmount;
            
            // Reset scroll when reached bottom
            if (scrollAmount >= (container.scrollHeight - container.clientHeight)) {
                // Pause at bottom for 2 seconds before resetting
                setTimeout(() => {
                    scrollAmount = 0;
                    container.scrollTop = 0;
                    // Resume scrolling after reset
                    this.autoScrollId = requestAnimationFrame(scroll);
                }, 2000);
            } else {
                this.autoScrollId = requestAnimationFrame(scroll);
            }
        };

        // Start scrolling
        this.autoScrollId = requestAnimationFrame(scroll);

        // Pause on hover
        container.addEventListener('mouseenter', () => {
            if (this.autoScrollId) {
                cancelAnimationFrame(this.autoScrollId);
            }
        });

        // Resume on mouse leave
        container.addEventListener('mouseleave', () => {
            this.autoScrollId = requestAnimationFrame(scroll);
        });

        // Pause on touch (for mobile devices)
        container.addEventListener('touchstart', () => {
            if (this.autoScrollId) {
                cancelAnimationFrame(this.autoScrollId);
            }
        });

        // Resume on touch end
        container.addEventListener('touchend', () => {
            this.autoScrollId = requestAnimationFrame(scroll);
        });
    }
};

// Initialize flight updates when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    FlightUpdates.init();
});

// Add this at the beginning of your script.js file
const NotificationSystem = {
    show(notification) {
        console.log('Notification:', notification);
        // Add actual notification implementation later
    }
};

// Update openFlightUpdates function
function openFlightUpdates() {
    console.log('Opening flight updates modal');
    const modal = document.getElementById('flight-updates-modal');
    const overlay = document.querySelector('.overlay');
    
    if (modal && overlay) {
        modal.style.display = 'block';
        overlay.style.display = 'block';
        FlightUpdates.init(); // Initialize flight updates
    }
}

// Update closeFlightUpdates function
function closeFlightUpdates() {
    console.log('Closing flight updates modal');
    const modal = document.getElementById('flight-updates-modal');
    const overlay = document.querySelector('.overlay');
    
    if (modal && overlay) {
        modal.style.display = 'none';
        overlay.style.display = 'none';
    }
}

// Add Crowd Monitoring System
const CrowdMonitor = {
    data: new Map(),
    alerts: [],
    
    init() {
        this.setupEventListeners();
        this.startMonitoring();
        this.initHeatmap();
    },
    
    setupEventListeners() {
        document.getElementById('area-filter')?.addEventListener('change', (e) => {
            this.updateDisplay(e.target.value);
        });
    },
    
    startMonitoring() {
        // Simulate real-time data updates
        setInterval(() => {
            this.updateCrowdData();
        }, 5000);
    },
    
    updateCrowdData() {
        // Simulate crowd data (replace with real API calls)
        const areas = ['security', 'checkin', 'immigration', 'baggage'];
        areas.forEach(area => {
            const count = Math.floor(Math.random() * 200);
            this.data.set(area, {
                count,
                level: this.getCrowdLevel(count),
                waitTime: Math.floor(Math.random() * 45)
            });
        });
        
        this.updateDisplay();
        this.checkAlerts();
    },
    
    getCrowdLevel(count) {
        if (count < 50) return 'low';
        if (count < 100) return 'moderate';
        return 'high';
    },
    
    updateDisplay(filter = 'all') {
        const container = document.querySelector('.crowd-stats-grid');
        if (!container) return;
        
        let html = '';
        this.data.forEach((data, area) => {
            if (filter === 'all' || filter === area) {
                html += this.createStatCard(area, data);
            }
        });
        
        container.innerHTML = html;
        this.updateHeatmap();
    },
    
    createStatCard(area, data) {
        return `
            <div class="crowd-stat-card">
                <div class="stat-header">
                    <h4>${area.charAt(0).toUpperCase() + area.slice(1)}</h4>
                    <span class="crowd-level level-${data.level}">
                        ${data.level.toUpperCase()}
                    </span>
                </div>
                <div class="stat-value">${data.count}</div>
                <div class="stat-wait">
                    Expected Wait: ${data.waitTime} mins
                </div>
            </div>
        `;
    },
    
    checkAlerts() {
        this.data.forEach((data, area) => {
            if (data.count > 150) {
                this.addAlert('critical', `Heavy crowding at ${area}`);
            } else if (data.count > 100) {
                this.addAlert('warning', `Moderate crowding at ${area}`);
            }
        });
    },
    
    addAlert(type, message) {
        const alert = {
            type,
            message,
            timestamp: new Date()
        };
        
        this.alerts.unshift(alert);
        this.alerts = this.alerts.slice(0, 10); // Keep only last 10 alerts
        this.updateAlerts();
    },
    
    updateAlerts() {
        const container = document.getElementById('crowd-alerts-list');
        if (!container) return;
        
        container.innerHTML = this.alerts.map(alert => `
            <div class="alert-item">
                <div class="alert-icon alert-${alert.type}">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-message">${alert.message}</div>
                    <div class="alert-time">
                        ${alert.timestamp.toLocaleTimeString()}
                    </div>
                </div>
            </div>
        `).join('');
    },
    
    initHeatmap() {
        // Initialize heatmap (using a library like heatmap.js)
        // This is a placeholder - implement actual heatmap
        console.log('Heatmap initialized');
    },
    
    updateHeatmap() {
        // Update heatmap with current crowd data
        // This is a placeholder - implement actual heatmap update
        console.log('Heatmap updated');
    }
};

// Initialize Crowd Monitor when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    CrowdMonitor.init();
});

// Add this function to update the crowd status display
function updateCrowdStatus(data) {
    const container = document.querySelector('.crowd-stats-grid');
    container.innerHTML = ''; // Clear existing content

    data.forEach(area => {
        const card = document.createElement('div');
        card.className = 'crowd-stat-card';
        card.innerHTML = `
            <h4>${area.name}</h4>
            <div class="status-level ${area.status.toLowerCase()}">${area.status}</div>
            <div class="count">${area.count}</div>
            <div class="expected-wait">Expected Wait: ${area.waitTime} mins</div>
        `;
        container.appendChild(card);
    });
}

// Call this function to load crowd data
function loadCrowdData() {
    // Simulated data for demonstration
    const crowdData = [
        { name: 'Security', status: 'LOW', count: 13, waitTime: 20 },
        { name: 'Checkin', status: 'MODERATE', count: 68, waitTime: 3 },
        { name: 'Immigration', status: 'MODERATE', count: 51, waitTime: 41 },
        { name: 'Baggage', status: 'HIGH', count: 188, waitTime: 25 }
    ];

    updateCrowdStatus(crowdData);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadCrowdData(); // Load crowd data on page load
});
