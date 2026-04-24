"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
  type Dispatch,
} from "react";
import React from "react";
import type { Booking, BookingPassenger, Schedule } from "./types";
import type { StopPoint, TripSearchResult } from "./mock-data";
import { createMockBooking, generateMockPaymentId } from "./mock-data";

// ── State types ──

export type BookingFlowState =
  | "search"
  | "results"
  | "seat_select"
  | "review"
  | "payment"
  | "confirmed";

export interface SearchParams {
  from: string; // city id
  to: string; // city id
  date: string; // YYYY-MM-DD
}

export interface PassengerDetail {
  seatNumber: string;
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  isPrimary: boolean;
}

export interface ConfirmedBookingInfo {
  booking: Booking;
  passengers: BookingPassenger[];
  trip: TripSearchResult;
  boardingStop: StopPoint;
  droppingStop: StopPoint;
}

export interface BookingState {
  searchParams: SearchParams;
  selectedTrip: TripSearchResult | null;
  selectedSeats: string[];
  boardingStop: StopPoint | null;
  droppingStop: StopPoint | null;
  passengers: PassengerDetail[];
  bookingState: BookingFlowState;
  confirmedBooking: ConfirmedBookingInfo | null;
  myBookings: ConfirmedBookingInfo[];
}

// ── Actions ──

export type BookingAction =
  | { type: "SET_SEARCH"; payload: SearchParams }
  | { type: "SET_TRIP"; payload: TripSearchResult }
  | { type: "SELECT_SEAT"; payload: string }
  | { type: "DESELECT_SEAT"; payload: string }
  | { type: "SET_BOARDING"; payload: StopPoint }
  | { type: "SET_DROPPING"; payload: StopPoint }
  | { type: "SET_PASSENGERS"; payload: PassengerDetail[] }
  | {
      type: "CONFIRM_BOOKING";
      payload: {
        contactEmail: string;
        contactPhone: string;
        serverBookingId?: string | null;
      };
    }
  | { type: "CANCEL_BOOKING"; payload: string } // booking id
  | { type: "SET_BOOKING_STATE"; payload: BookingFlowState }
  | { type: "RESET" }
  | { type: "LOAD_BOOKINGS"; payload: ConfirmedBookingInfo[] };

// ── Initial state ──

const today = new Date();
const todayStr = today.toISOString().split("T")[0];

const initialState: BookingState = {
  searchParams: { from: "", to: "", date: todayStr },
  selectedTrip: null,
  selectedSeats: [],
  boardingStop: null,
  droppingStop: null,
  passengers: [],
  bookingState: "search",
  confirmedBooking: null,
  myBookings: [],
};

// ── Reducer ──

function bookingReducer(
  state: BookingState,
  action: BookingAction
): BookingState {
  switch (action.type) {
    case "SET_SEARCH":
      return {
        ...state,
        searchParams: action.payload,
        bookingState: "results",
        // Clear downstream selections when search changes
        selectedTrip: null,
        selectedSeats: [],
        boardingStop: null,
        droppingStop: null,
        passengers: [],
        confirmedBooking: null,
      };

    case "SET_TRIP":
      return {
        ...state,
        selectedTrip: action.payload,
        bookingState: "seat_select",
        // Clear seat-dependent state
        selectedSeats: [],
        boardingStop: null,
        droppingStop: null,
        passengers: [],
        confirmedBooking: null,
      };

    case "SELECT_SEAT": {
      if (state.selectedSeats.includes(action.payload)) return state;
      if (state.selectedSeats.length >= 6) return state; // MAX_SEATS_PER_BOOKING
      return {
        ...state,
        selectedSeats: [...state.selectedSeats, action.payload],
      };
    }

    case "DESELECT_SEAT":
      return {
        ...state,
        selectedSeats: state.selectedSeats.filter(
          (id) => id !== action.payload
        ),
        passengers: state.passengers.filter(
          (p) => p.seatNumber !== action.payload
        ),
      };

    case "SET_BOARDING":
      return { ...state, boardingStop: action.payload };

    case "SET_DROPPING":
      return { ...state, droppingStop: action.payload };

    case "SET_PASSENGERS":
      return { ...state, passengers: action.payload };

    case "SET_BOOKING_STATE":
      return { ...state, bookingState: action.payload };

    case "CONFIRM_BOOKING": {
      if (
        !state.selectedTrip ||
        !state.boardingStop ||
        !state.droppingStop ||
        state.passengers.length === 0
      ) {
        return state;
      }

      const trip = state.selectedTrip;
      const schedule = trip.schedule;

      // Calculate total amount
      const bus = schedule.bus;
      let totalAmount = 0;
      for (const passenger of state.passengers) {
        const seatInfo = bus.seat_layout.decks
          .flatMap((d) => d.seats)
          .find((s) => s.id === passenger.seatNumber);
        if (seatInfo) {
          if (seatInfo.price_tier === "sleeper" && trip.effective_sleeper_price) {
            totalAmount += trip.effective_sleeper_price;
          } else {
            totalAmount += trip.effective_price;
          }
        } else {
          totalAmount += trip.effective_price;
        }
      }

      const { booking, passengers } = createMockBooking({
        userId: "mock-user-1",
        schedule,
        travelDate: trip.travel_date,
        totalAmount,
        contactEmail: action.payload.contactEmail,
        contactPhone: action.payload.contactPhone,
        passengers: state.passengers.map((p) => ({
          seatNumber: p.seatNumber,
          name: p.name,
          age: p.age,
          gender: p.gender,
          isPrimary: p.isPrimary,
        })),
      });

      // Prefer the real booking ID from the server when live-mode is active
      if (action.payload.serverBookingId) {
        booking.id = action.payload.serverBookingId;
        for (const p of passengers) {
          p.booking_id = action.payload.serverBookingId;
        }
      }

      const confirmedInfo: ConfirmedBookingInfo = {
        booking,
        passengers,
        trip,
        boardingStop: state.boardingStop,
        droppingStop: state.droppingStop,
      };

      const updatedBookings = [confirmedInfo, ...state.myBookings];

      // Persist to localStorage
      try {
        localStorage.setItem(
          "busbook_my_bookings",
          JSON.stringify(updatedBookings)
        );
      } catch {
        // localStorage may be unavailable in SSR
      }

      return {
        ...state,
        confirmedBooking: confirmedInfo,
        myBookings: updatedBookings,
        bookingState: "confirmed",
      };
    }

    case "CANCEL_BOOKING": {
      const updatedBookings = state.myBookings.map((b) => {
        if (b.booking.id === action.payload) {
          return {
            ...b,
            booking: {
              ...b.booking,
              status: "cancelled" as const,
              cancelled_at: new Date().toISOString(),
              cancellation_reason: "Cancelled by user",
            },
          };
        }
        return b;
      });

      try {
        localStorage.setItem(
          "busbook_my_bookings",
          JSON.stringify(updatedBookings)
        );
      } catch {
        // localStorage may be unavailable
      }

      return {
        ...state,
        myBookings: updatedBookings,
      };
    }

    case "RESET":
      return {
        ...initialState,
        myBookings: state.myBookings, // preserve bookings history
      };

    case "LOAD_BOOKINGS":
      return { ...state, myBookings: action.payload };

    default:
      return state;
  }
}

// ── Context ──

interface BookingContextValue {
  state: BookingState;
  dispatch: Dispatch<BookingAction>;
}

const BookingContext = createContext<BookingContextValue | null>(null);

// ── Provider ──

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  // Load saved bookings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("busbook_my_bookings");
      if (saved) {
        const parsed = JSON.parse(saved) as ConfirmedBookingInfo[];
        dispatch({ type: "LOAD_BOOKINGS", payload: parsed });
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  return React.createElement(
    BookingContext.Provider,
    { value: { state, dispatch } },
    children
  );
}

// ── Hook ──

export function useBooking(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (!ctx) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return ctx;
}
