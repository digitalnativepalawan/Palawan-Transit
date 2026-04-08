/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TransportMode = 'SHUTTLE_SHARED' | 'SHUTTLE_PRIVATE' | 'PRIVATE_4X4' | 'BANGKA' | 'ISLAND_HOPPING';
export type BookingType = 'INSTANT' | 'REQUEST';
export type BookingStatus = 'PENDING' | 'ACCEPTED' | 'CANCELLED' | 'CONFIRMED' | 'COMPLETED';

export interface Route {
  id: string;
  from: string;
  to: string;
  mode: TransportMode;
  price: number;
  duration: string;
  seatsLeft: number | null;
  operator: string;
  bookingType: BookingType;
  departureTime: string;
  operatorId?: string;
  description?: string;
  amenities?: string[];
  pickupPoint?: string;
  dropoffPoint?: string;
}

export interface IslandHoppingTour {
  id: string;
  location: string;
  tour_name: string;
  shared_price_per_person: number;
  private_boat_flat_rate: number;
  max_passengers: number;
  duration: string;
  departure_point: string;
  inclusions: string[];
  highlights: string[];
  is_active: boolean;
}

export interface OperatorPermit {
  type: string;
  label: string;
  url: string;
  file_name: string;
  uploaded_at: string;
}

export interface Operator {
  id: string;
  name: string;
  phone: string;
  type: 'VAN' | 'BOAT' | 'PRIVATE';
  location: string;
  rating: number;
  whatsapp?: string;
  email?: string;
  description?: string;
  images?: string[];
  vehicle_photos?: string[];
  permits?: OperatorPermit[];
}

export interface Booking {
  id: string;
  routeId: string;
  date: string;
  seats: number;
  status: BookingStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalPrice: number;
  referenceCode: string;
  operatorId?: string;
  createdAt: string;
  isIslandHopping?: boolean;
  tourId?: string;
  groupType?: 'SHARED' | 'PRIVATE';
}

export type SearchType = 'TRANSPORT' | 'ISLAND_HOPPING';

export const CITIES = ['Puerto Princesa', 'El Nido', 'Port Barton', 'San Vicente'];
export const ISLAND_LOCATIONS = ['Port Barton', 'San Vicente', 'El Nido'];
export const TOURS = ['Island Hop Tour A', 'Island Hop Tour B', 'Island Hop Tour C', 'Underground River Tour', 'Firefly Watching'];
export const DESTINATIONS = [...CITIES, ...TOURS];
