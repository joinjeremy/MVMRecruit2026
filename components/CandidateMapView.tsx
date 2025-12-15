
import React, { useEffect, useRef } from 'react';
import { Candidate } from '../types';

interface CandidateMapViewProps {
    candidates: Candidate[];
    onSelect: (candidate: Candidate) => void;
}

declare global {
    interface Window {
        L: any;
    }
}

// Simple hash function to generate deterministic pseudo-random coords from a string
const getCoordsFromPostcode = (postcode: string): [number, number] | null => {
    // Default center UK
    const baseLat = 52.3555; 
    const baseLng = -1.1743;
    
    if (!postcode || postcode.trim().length < 2) return null;

    let hash = 0;
    for (let i = 0; i < postcode.length; i++) {
        hash = postcode.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Spread markers out a bit around the center based on hash, 
    // simulating regional grouping roughly if we don't have real geocoding.
    // In a real app, this would use a Geocoding API.
    const latOffset = (hash % 1000) / 200; // Approx +/- 2.5 degrees
    const lngOffset = ((hash >> 2) % 1000) / 200;

    return [baseLat + latOffset, baseLng + lngOffset];
}

const CandidateMapView: React.FC<CandidateMapViewProps> = ({ candidates, onSelect }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMap = useRef<any>(null);

    // Initialize Map
    useEffect(() => {
        if (!mapRef.current) return;

        const L = window.L;
        if (!L) return;

        // Prevent double initialization
        if (leafletMap.current) return;

        leafletMap.current = L.map(mapRef.current).setView([54.0, -2.0], 6);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(leafletMap.current);

        // Cleanup function to remove map instance on unmount
        return () => {
            if (leafletMap.current) {
                leafletMap.current.remove();
                leafletMap.current = null;
            }
        };
    }, []);

    // Update Markers
    useEffect(() => {
        const L = window.L;
        if (!L || !leafletMap.current) return;

        // Clear existing layers (except tiles)
        // A robust way to clear markers without removing tiles is to check layer type or use a LayerGroup.
        // Here we iterate and remove Markers specifically.
        leafletMap.current.eachLayer((layer: any) => {
            if (layer instanceof L.Marker) {
                leafletMap.current.removeLayer(layer);
            }
        });

        // Add Markers
        candidates.forEach(candidate => {
            const coords = getCoordsFromPostcode(candidate.postcode);
            
            if (coords) {
                const [lat, lng] = coords;
                const marker = L.marker([lat, lng]).addTo(leafletMap.current);
                
                const popupContent = `
                    <div class="p-2 min-w-[150px] font-sans">
                        <h3 class="font-bold text-sm text-gray-800">${candidate.name}</h3>
                        <p class="text-xs text-gray-600">${candidate.postcode || ''}</p>
                        <p class="text-xs text-blue-600 font-medium mt-1">${candidate.status}</p>
                    </div>
                `;
                
                marker.bindPopup(popupContent);
                marker.on('click', () => onSelect(candidate));
            }
        });

    }, [candidates, onSelect]);

    return (
        <div className="h-full w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
            <div ref={mapRef} className="h-full w-full z-0" />
        </div>
    );
};

export default CandidateMapView;
