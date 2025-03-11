import { partyStore } from '../stores/partyStore';
import { PartyType } from '../types/party';

export function usePartyLookup() {
  const lookupById = (type: PartyType, id: string) => {
    const party = partyStore.getById(type, id);
    return party?.name || '';
  };

  const lookupByName = (type: PartyType, name: string) => {
    const parties = partyStore.getAll(type);
    return parties.find(party => party.name === name)?.id || '';
  };

  const getSuggestions = (type: PartyType, query: string) => {
    const parties = partyStore.getAll(type);
    const normalizedQuery = query.toLowerCase();
    return parties.filter(party => 
      party.id.toLowerCase().includes(normalizedQuery) ||
      party.name.toLowerCase().includes(normalizedQuery)
    );
  };

  return {
    lookupById,
    lookupByName,
    getSuggestions,
  };
}