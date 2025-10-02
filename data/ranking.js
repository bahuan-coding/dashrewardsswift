/**
 * Ranking Data Module - Swift Elite Rewards
 * Handles NPS ranking data loading, filtering, and calculations
 */

class RankingData {
  constructor() {
    this.data = [];
    this.filteredData = [];
    this.currentPeriod = 'current'; // 'current' or 'previous'
    this.currentRegion = 'all';
    this.currentSearch = '';
  }

  /**
   * Load ranking data from mock JSON
   */
  async loadData() {
    try {
      const response = await fetch('./data/ranking.mock.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.data = await response.json();
      this.filteredData = [...this.data];
      return this.data;
    } catch (error) {
      console.error('Error loading ranking data:', error);
      throw error;
    }
  }

  /**
   * Get all available regions from the data
   */
  getRegions() {
    const regions = new Set(this.data.map(item => item.regiao));
    return Array.from(regions).sort();
  }

  /**
   * Calculate NPS delta (difference from previous month)
   */
  calculateDelta(nps, npsAnterior) {
    if (npsAnterior === null || npsAnterior === undefined) {
      return null;
    }
    return parseFloat((nps - npsAnterior).toFixed(1));
  }

  /**
   * Filter data by region
   */
  filterByRegion(region) {
    this.currentRegion = region;
    this.applyFilters();
    return this.filteredData;
  }

  /**
   * Filter data by store name search
   */
  filterBySearch(searchTerm) {
    this.currentSearch = searchTerm.toLowerCase().trim();
    this.applyFilters();
    return this.filteredData;
  }

  /**
   * Apply all current filters
   */
  applyFilters() {
    let filtered = [...this.data];

    // Filter by region
    if (this.currentRegion !== 'all') {
      filtered = filtered.filter(item => item.regiao === this.currentRegion);
    }

    // Filter by search term
    if (this.currentSearch) {
      filtered = filtered.filter(item => 
        item.lojaNome.toLowerCase().includes(this.currentSearch)
      );
    }

    // Sort by NPS descending, then by npsAnterior descending, then by name ascending
    filtered.sort((a, b) => {
      // Primary sort: NPS descending
      if (b.nps !== a.nps) {
        return b.nps - a.nps;
      }
      
      // Secondary sort: npsAnterior descending (handle null values)
      const aAnterior = a.npsAnterior || 0;
      const bAnterior = b.npsAnterior || 0;
      if (bAnterior !== aAnterior) {
        return bAnterior - aAnterior;
      }
      
      // Tertiary sort: lojaNome ascending
      return a.lojaNome.localeCompare(b.lojaNome);
    });

    // Update positions based on filtered results
    filtered.forEach((item, index) => {
      item.posicao = index + 1;
    });

    this.filteredData = filtered;
  }

  /**
   * Get top 3 stores for podium display
   */
  getTop3() {
    return this.filteredData.slice(0, 3);
  }

  /**
   * Get "Minha Loja" data regardless of current filters
   */
  getMinhaLoja() {
    return this.data.find(item => item.destaque === true);
  }

  /**
   * Get remaining stores (excluding top 3) for list display
   */
  getRemainingStores(limit = 50) {
    return this.filteredData.slice(3, 3 + limit);
  }

  /**
   * Get all filtered data
   */
  getFilteredData() {
    return this.filteredData;
  }

  /**
   * Get current filter state
   */
  getFilterState() {
    return {
      period: this.currentPeriod,
      region: this.currentRegion,
      search: this.currentSearch
    };
  }

  /**
   * Reset all filters
   */
  resetFilters() {
    this.currentRegion = 'all';
    this.currentSearch = '';
    this.applyFilters();
    return this.filteredData;
  }

  /**
   * Get store by ID
   */
  getStoreById(id) {
    return this.data.find(item => item.id === id);
  }

  /**
   * Get total number of stores
   */
  getTotalStores() {
    return this.data.length;
  }

  /**
   * Get filtered stores count
   */
  getFilteredStoresCount() {
    return this.filteredData.length;
  }
}

// Export for use in ranking page
window.RankingData = RankingData;
