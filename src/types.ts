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
  seatsLeft: number;
  operator: string;
  bookingType: BookingType;
  departureTime: string;
  operatorId?: string;
  description?: string;
  amenities?: string[];
  pickupPoint?: string;
  dropoffPoint?: string;
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
}

export const ROUTES: Route[] = [
  {
    id: 'r1',
    from: 'Puerto Princesa',
    to: 'El Nido',
    mode: 'SHUTTLE_SHARED',
    price: 600,
    duration: '5.5 HRS',
    seatsLeft: 10,
    operator: 'Fortwally Transport',
    operatorId: 'op-1',
    bookingType: 'INSTANT',
    departureTime: '08:00 AM'
  },
  {
    id: 'r1-p',
    from: 'Puerto Princesa',
    to: 'El Nido',
    mode: 'SHUTTLE_PRIVATE',
    price: 5500,
    duration: '5 HRS',
    seatsLeft: 1,
    operator: 'Fortwally Transport',
    operatorId: 'op-1',
    bookingType: 'REQUEST',
    departureTime: 'Anytime'
  },
  {
    id: 'r1-4x4',
    from: 'Puerto Princesa',
    to: 'El Nido',
    mode: 'PRIVATE_4X4',
    price: 7500,
    duration: '4.5 HRS',
    seatsLeft: 1,
    operator: 'Palawan 4x4 Expeditions',
    operatorId: 'op-6',
    bookingType: 'REQUEST',
    departureTime: 'Anytime'
  },
  {
    id: 'r2',
    from: 'El Nido',
    to: 'Coron',
    mode: 'BANGKA',
    price: 2800,
    duration: '5 HRS',
    seatsLeft: 12,
    operator: 'Montenegro Lines',
    operatorId: 'op-3',
    bookingType: 'REQUEST',
    departureTime: '07:30 AM'
  },
  {
    id: 'r3',
    from: 'Puerto Princesa',
    to: 'Port Barton',
    mode: 'SHUTTLE_SHARED',
    price: 450,
    duration: '3.5 HRS',
    seatsLeft: 8,
    operator: 'Recaro Transport',
    operatorId: 'op-4',
    bookingType: 'INSTANT',
    departureTime: '09:00 AM'
  },
  {
    id: 'r4',
    from: 'El Nido',
    to: 'Island Hop Tour A',
    mode: 'ISLAND_HOPPING',
    price: 1200,
    duration: '7 HRS',
    seatsLeft: 15,
    operator: 'El Nido Boatmen',
    operatorId: 'op-2',
    bookingType: 'INSTANT',
    departureTime: '09:00 AM'
  },
  {
    id: 'r6',
    from: 'El Nido',
    to: 'Island Hop Tour B',
    mode: 'ISLAND_HOPPING',
    price: 1300,
    duration: '7 HRS',
    seatsLeft: 10,
    operator: 'El Nido Boatmen',
    operatorId: 'op-2',
    bookingType: 'INSTANT',
    departureTime: '08:30 AM'
  },
  {
    id: 'r7',
    from: 'Puerto Princesa',
    to: 'Underground River Tour',
    mode: 'ISLAND_HOPPING',
    price: 2200,
    duration: '8 HRS',
    seatsLeft: 20,
    operator: 'PP Underground River',
    operatorId: 'op-1',
    bookingType: 'INSTANT',
    departureTime: '07:00 AM'
  }
];

export type SearchType = 'TRANSPORT' | 'ISLAND_HOPPING';

export const CITIES = [
  'Puerto Princesa',
  'El Nido',
  'Coron',
  'Port Barton',
  'San Vicente'
];

export const TOURS = [
  'Island Hop Tour A',
  'Island Hop Tour B',
  'Island Hop Tour C',
  'Underground River Tour',
  'Firefly Watching'
];

export const DESTINATIONS = [...CITIES, ...TOURS];
