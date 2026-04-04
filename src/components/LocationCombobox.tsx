"use client";

import * as React from "react";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Major Indian cities with their common aliases / states
export const INDIA_CITIES = [
  // Metros & Megacities
  { city: "Mumbai", state: "Maharashtra", aliases: ["bombay"] },
  { city: "Delhi", state: "Delhi", aliases: ["new delhi", "ncr"] },
  { city: "Bangalore", state: "Karnataka", aliases: ["bengaluru", "bengalore"] },
  { city: "Hyderabad", state: "Telangana", aliases: ["hyd"] },
  { city: "Chennai", state: "Tamil Nadu", aliases: ["madras"] },
  { city: "Kolkata", state: "West Bengal", aliases: ["calcutta"] },
  { city: "Pune", state: "Maharashtra", aliases: ["poona"] },
  { city: "Ahmedabad", state: "Gujarat", aliases: [] },
  { city: "Surat", state: "Gujarat", aliases: [] },
  { city: "Jaipur", state: "Rajasthan", aliases: ["pink city"] },
  { city: "Lucknow", state: "Uttar Pradesh", aliases: [] },
  { city: "Kanpur", state: "Uttar Pradesh", aliases: [] },
  { city: "Nagpur", state: "Maharashtra", aliases: [] },
  { city: "Indore", state: "Madhya Pradesh", aliases: [] },
  { city: "Thane", state: "Maharashtra", aliases: [] },
  { city: "Bhopal", state: "Madhya Pradesh", aliases: [] },
  { city: "Visakhapatnam", state: "Andhra Pradesh", aliases: ["vizag"] },
  { city: "Patna", state: "Bihar", aliases: [] },
  { city: "Vadodara", state: "Gujarat", aliases: ["baroda"] },
  { city: "Ghaziabad", state: "Uttar Pradesh", aliases: [] },
  { city: "Ludhiana", state: "Punjab", aliases: [] },
  { city: "Agra", state: "Uttar Pradesh", aliases: [] },
  { city: "Nashik", state: "Maharashtra", aliases: [] },
  { city: "Faridabad", state: "Haryana", aliases: [] },
  { city: "Meerut", state: "Uttar Pradesh", aliases: [] },
  { city: "Rajkot", state: "Gujarat", aliases: [] },
  { city: "Varanasi", state: "Uttar Pradesh", aliases: ["banaras"] },
  { city: "Srinagar", state: "Jammu & Kashmir", aliases: [] },
  { city: "Aurangabad", state: "Maharashtra", aliases: [] },
  { city: "Dhanbad", state: "Jharkhand", aliases: [] },
  { city: "Amritsar", state: "Punjab", aliases: [] },
  { city: "Navi Mumbai", state: "Maharashtra", aliases: [] },
  { city: "Allahabad", state: "Uttar Pradesh", aliases: ["prayagraj"] },
  { city: "Ranchi", state: "Jharkhand", aliases: [] },
  { city: "Howrah", state: "West Bengal", aliases: [] },
  { city: "Coimbatore", state: "Tamil Nadu", aliases: [] },
  { city: "Jabalpur", state: "Madhya Pradesh", aliases: [] },
  { city: "Gwalior", state: "Madhya Pradesh", aliases: [] },
  { city: "Vijayawada", state: "Andhra Pradesh", aliases: [] },
  { city: "Jodhpur", state: "Rajasthan", aliases: [] },
  { city: "Madurai", state: "Tamil Nadu", aliases: [] },
  { city: "Raipur", state: "Chhattisgarh", aliases: [] },
  { city: "Kota", state: "Rajasthan", aliases: [] },
  { city: "Guwahati", state: "Assam", aliases: [] },
  { city: "Chandigarh", state: "Punjab/Haryana", aliases: [] },
  { city: "Solapur", state: "Maharashtra", aliases: [] },
  { city: "Hubli-Dharwad", state: "Karnataka", aliases: ["hubli", "dharwad"] },
  { city: "Mysore", state: "Karnataka", aliases: ["mysuru"] },
  { city: "Tiruchirappalli", state: "Tamil Nadu", aliases: ["trichy"] },
  { city: "Bareilly", state: "Uttar Pradesh", aliases: [] },
  { city: "Aligarh", state: "Uttar Pradesh", aliases: [] },
  { city: "Tiruppur", state: "Tamil Nadu", aliases: [] },
  { city: "Gurgaon", state: "Haryana", aliases: ["gurugram"] },
  { city: "Moradabad", state: "Uttar Pradesh", aliases: [] },
  { city: "Jalandhar", state: "Punjab", aliases: [] },
  { city: "Bhubaneswar", state: "Odisha", aliases: [] },
  { city: "Salem", state: "Tamil Nadu", aliases: [] },
  { city: "Warangal", state: "Telangana", aliases: [] },
  { city: "Guntur", state: "Andhra Pradesh", aliases: [] },
  { city: "Bhiwandi", state: "Maharashtra", aliases: [] },
  { city: "Saharanpur", state: "Uttar Pradesh", aliases: [] },
  { city: "Gorakhpur", state: "Uttar Pradesh", aliases: [] },
  { city: "Bikaner", state: "Rajasthan", aliases: [] },
  { city: "Amravati", state: "Maharashtra", aliases: [] },
  { city: "Noida", state: "Uttar Pradesh", aliases: [] },
  { city: "Jamshedpur", state: "Jharkhand", aliases: [] },
  { city: "Bhilai", state: "Chhattisgarh", aliases: [] },
  { city: "Cuttack", state: "Odisha", aliases: [] },
  { city: "Firozabad", state: "Uttar Pradesh", aliases: [] },
  { city: "Kochi", state: "Kerala", aliases: ["cochin", "ernakulam"] },
  { city: "Thiruvananthapuram", state: "Kerala", aliases: ["trivandrum"] },
  { city: "Kozhikode", state: "Kerala", aliases: ["calicut"] },
  { city: "Mangaluru", state: "Karnataka", aliases: ["mangalore"] },
  { city: "Pondicherry", state: "Puducherry", aliases: ["puducherry"] },
  { city: "Dehradun", state: "Uttarakhand", aliases: [] },
  { city: "Shimla", state: "Himachal Pradesh", aliases: [] },
  { city: "Jammu", state: "Jammu & Kashmir", aliases: [] },
  { city: "Agartala", state: "Tripura", aliases: [] },
  { city: "Panaji", state: "Goa", aliases: ["panjim"] },
];

/** Extract just the city part from a location string like "Mumbai, Maharashtra" */
export function extractCityFromLocation(location: string): string {
  const parts = location.split(",");
  return parts[0].trim();
}

/**
 * Returns true if the job location matches the selected city.
 * Handles aliases like "Bengaluru" for "Bangalore", "Gurugram" for "Gurgaon", etc.
 */
export function locationMatchesCity(jobLocation: string, selectedCity: string): boolean {
  if (!selectedCity) return true;

  const cityEntry = INDIA_CITIES.find(
    (c) => c.city.toLowerCase() === selectedCity.toLowerCase()
  );

  const jobLoc = jobLocation.toLowerCase();
  const jobCity = extractCityFromLocation(jobLocation).toLowerCase();

  if (cityEntry) {
    // Match city name or any of its aliases
    const namesToCheck = [cityEntry.city.toLowerCase(), ...cityEntry.aliases];
    return namesToCheck.some((n) => jobCity === n || jobLoc.includes(n));
  }

  // Fallback: substring match
  return jobCity.includes(selectedCity.toLowerCase()) || jobLoc.includes(selectedCity.toLowerCase());
}

interface LocationComboboxProps {
  value: string;
  onChange: (city: string) => void;
  disabled?: boolean;
}

export function LocationCombobox({ value, onChange, disabled }: LocationComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedEntry = INDIA_CITIES.find(
    (c) => c.city.toLowerCase() === value.toLowerCase()
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between bg-background border-border font-medium h-10 px-3"
        >
          <span className="flex items-center gap-2 truncate">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            {value ? (
              <span className="truncate">
                {value}
                {selectedEntry && (
                  <span className="text-muted-foreground font-normal ml-1">
                    · {selectedEntry.state}
                  </span>
                )}
              </span>
            ) : (
              <span className="text-muted-foreground">Select a city...</span>
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search city..." />
          <CommandList>
            <CommandEmpty>No city found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value=""
                onSelect={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
                <Check
                  className={cn("mr-2 h-4 w-4", !value ? "opacity-100" : "opacity-0")}
                />
                <span className="text-muted-foreground">Any location</span>
              </CommandItem>
              {INDIA_CITIES.map((entry) => (
                <CommandItem
                  key={entry.city}
                  value={entry.city}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.toLowerCase() === entry.city.toLowerCase()
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <span className="flex-1">{entry.city}</span>
                  <span className="text-xs text-muted-foreground ml-2 truncate">{entry.state}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
