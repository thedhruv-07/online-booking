import { Country, State } from 'country-state-city';

/**
 * Get all countries formatted for Select component
 * @returns {Array<{id: string, name: string}>}
 */
export const getCountries = () => {
  return Country.getAllCountries().map(country => ({
    id: country.isoCode,
    name: country.name
  }));
};

/**
 * Get all states for a specific country formatted for Select component
 * @param {string} countryIsoCode - The ISO code of the country (e.g., 'US', 'IN')
 * @returns {Array<{id: string, name: string}>}
 */
export const getStatesByCountry = (countryIsoCode) => {
  if (!countryIsoCode) return [];
  
  return State.getStatesOfCountry(countryIsoCode).map(state => ({
    id: state.isoCode,
    name: state.name
  }));
};

/**
 * Get country name by ISO code
 * @param {string} isoCode 
 * @returns {string}
 */
export const getCountryName = (isoCode) => {
  return Country.getCountryByCode(isoCode)?.name || isoCode;
};

/**
 * Get state name by country and state ISO code
 * @param {string} countryIsoCode 
 * @param {string} stateIsoCode 
 * @returns {string}
 */
export const getStateName = (countryIsoCode, stateIsoCode) => {
  return State.getStateByCodeAndCountry(stateIsoCode, countryIsoCode)?.name || stateIsoCode;
};
