"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type LocationContextType = {
  selectedCity: string | null;
  setSelectedCity: (city: string | null) => void;
};

const LocationContext = createContext<LocationContextType>({
  selectedCity: null,
  setSelectedCity: () => {},
});

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [selectedCity, setSelectedCityState] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("assigame-city");
    if (saved) setSelectedCityState(saved);
  }, []);

  const setSelectedCity = (city: string | null) => {
    setSelectedCityState(city);
    if (city) localStorage.setItem("assigame-city", city);
    else localStorage.removeItem("assigame-city");
  };

  return (
    <LocationContext.Provider value={{ selectedCity, setSelectedCity }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}
