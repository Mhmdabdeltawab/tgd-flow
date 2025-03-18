import React, { useState, useEffect } from "react";
import { Building2, User } from "lucide-react";
import useSupabasePartyStore from "../../stores/supabasePartyStore";
import { countries } from "../../data/countries";
import { useToast } from "../../hooks/useToast";
import FormField from "./FormField";

interface PartyInputProps {
  type: "buyers" | "sellers";
  id: string;
  name: string;
  onIdChange: (value: string) => void;
  onNameChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export default function PartyInput({
  type,
  id,
  name,
  onIdChange,
  onNameChange,
  error,
  required,
}: PartyInputProps) {
  const toast = useToast();
  const Icon = type === "buyers" ? Building2 : User;
  const label = type === "buyers" ? "Buyer" : "Supplier";
  const supabasePartyStore = useSupabasePartyStore();
  const [options, setOptions] = useState<Array<{ id: string; name: string }>>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from Supabase only
  useEffect(() => {
    let isMounted = true;
    const fetchParties = async () => {
      if (!isMounted) return;
      setIsLoading(true);
      try {
        // Convert sellers to suppliers for the API call
        const partyType = type === "sellers" ? "suppliers" : type;
        console.log(`PartyInput: Fetching ${partyType} from Supabase...`);
        const parties = await supabasePartyStore.getAll(partyType);
        console.log(
          `PartyInput: Received ${parties.length} ${partyType} from Supabase:`,
          parties,
        );

        if (isMounted) {
          const mappedOptions = parties.map((party) => ({
            id: party.id,
            name: party.name,
          }));
          console.log(
            `PartyInput: Setting ${mappedOptions.length} options for ${partyType}`,
          );
          setOptions(mappedOptions);
        }
      } catch (error) {
        console.error(`Error fetching ${type}:`, error);
        if (isMounted) {
          toast.error(`Failed to load ${label} data. Please try again.`);
          setOptions([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchParties();

    return () => {
      isMounted = false;
    };
  }, [type, label, toast, supabasePartyStore]); // Added supabasePartyStore dependency

  const handleSelect = (selectedId: string) => {
    const selected = options.find((option) => option.id === selectedId);
    if (selected) {
      // Check if the ID is a valid UUID before setting it
      const isValidUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          selected.id,
        );

      if (!isValidUuid) {
        toast.error(
          `Invalid UUID format for ${label} ID: ${selected.id}. Please use a valid UUID.`,
        );
        return;
      }

      onIdChange(selected.id);
      onNameChange(selected.name);
    } else {
      onIdChange("");
      onNameChange("");
    }
  };

  // Filter out duplicates by ID before rendering
  const uniqueOptions = React.useMemo(() => {
    const seen = new Set();
    return options.filter((option) => {
      if (seen.has(option.id)) {
        return false;
      }
      seen.add(option.id);
      return true;
    });
  }, [options]);

  return (
    <FormField label={label} error={error} required={required}>
      <div className="space-y-4">
        <div className="relative">
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={id}
            onChange={(e) => handleSelect(e.target.value)}
            className={`
              w-full pl-10 pr-4 py-2.5 
              border rounded-lg appearance-none
              text-sm text-gray-900
              transition-colors duration-200
              ${
                error
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              }
              focus:outline-none focus:ring-2
              ${isLoading ? "opacity-70 cursor-wait" : ""}
            `}
            disabled={isLoading}
          >
            <option value="">
              {isLoading ? "Loading..." : `Select ${label}`}
            </option>
            {!isLoading &&
              uniqueOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name} ({option.id})
                </option>
              ))}
          </select>
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {id && name && (
          <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-start gap-3">
              <Icon className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-gray-900">{name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{id}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </FormField>
  );
}
