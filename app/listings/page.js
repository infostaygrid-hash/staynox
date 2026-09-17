'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { filterProperties } from '@/app/data/properties';
import PropertyCard from '@/app/components/PropertyCard';
import styles from './page.module.css';

const AREAS = [
  'Knowledge Park I', 'Knowledge Park II', 'Knowledge Park III',
  'Alpha I', 'Alpha II', 'Beta I', 'Beta II',
  'Gamma I', 'Delta I', 'Delta II',
  'Pari Chowk', 'Sector 62', 'Sector 63', 'Sector 16',
  'Kasna', 'Surajpur', 'Omicron I', 'Omicron II'
];

const AMENITIES_LIST = [
  { id: 'Food',       label: 'Food Included', icon: '🍽️' },
  { id: 'WiFi',       label: 'WiFi',          icon: '📶' },
  { id: 'AC',         label: 'AC',            icon: '❄️' },
  { id: 'Laundry',   label: 'Laundry',       icon: '🧺' },
  { id: 'Parking',   label: 'Parking',       icon: '🅿️' },
  { id: 'Gym',        label: 'Gym',           icon: '💪' },
];

const BUDGET_RANGES = [
  { key: 'all',    label: 'Any Budget',       min: 0,     max: 999999 },
  { key: 'low',    label: '₹8k – ₹12k',      min: 8000,  max: 12000  },
  { key: 'mid',    label: '₹12k – ₹18k',     min: 12000, max: 18000  },
  { key: 'high',   label: 'Above ₹18k',      min: 18000, max: 999999 },
];

const DEFAULT_FILTERS = {
  search: '',
  area: '',
  type: 'all',
  gender: 'all',
  budget: 'all',
  sharing: 'all',
  term: 'all',
  amenities: [],
  verifiedOnly: false,
  sort: 'relevance',
};

function ListingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notifyContact, setNotifyContact] = useState('');
  const [notifySent, setNotifySent] = useState(false);
  const [areaSearch, setAreaSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Read filters from URL on mount
  useEffect(() => {
    const am = searchParams.get('amenities');
    setFilters({
      search:      searchParams.get('search') || searchParams.get('q') || '',
      area:        searchParams.get('area') || '',
      type:        searchParams.get('type') || 'all',
      gender:      searchParams.get('gender') || 'all',
      budget:      searchParams.get('budget') || 'all',
      sharing:     searchParams.get('sharing') || 'all',
      term:        searchParams.get('term') || 'all',
      amenities:   am ? am.split(',') : [],
      verifiedOnly: searchParams.get('verified') === 'true',
      sort:        searchParams.get('sort') || 'relevance',
    });
  }, [searchParams]);

  // Fetch + filter results whenever filters change
  useEffect(() => {
    setIsLoading(true);
    const budgetRange = BUDGET_RANGES.find(b => b.key === filters.budget) || BUDGET_RANGES[0];

    const fetchAndFilter = async () => {
      let results = await filterProperties({
        search:   filters.search,
        type:     filters.type !== 'all' ? filters.type : undefined,
        gender:   filters.gender !== 'all' ? filters.gender : undefined,
        area:     filters.area || undefined,
        minPrice: budgetRange.min,
        maxPrice: budgetRange.max,
        amenities: filters.amenities.length > 0 ? filters.amenities : undefined,
      });

      // Sharing filter (in-memory since it's nested in price obj)
      if (filters.sharing !== 'all') {
        results = results.filter(p => p.price?.[filters.sharing] != null);
      }

      // Term filter (in-memory check against rules/desc)
      if (filters.term !== 'all') {
        results = results.filter(p => 
          (p.rules && p.rules.some(r => r.toLowerCase().includes(filters.term))) || 
          (p.description && p.description.toLowerCase().includes(filters.term))
        );
      }

      // Verified filter
      if (filters.verifiedOnly) {
        results = results.filter(p => p.isVerified);
      }

      // Sort
      if (filters.sort === 'price-low') {
        results.sort((a, b) => {
          const min = p => Math.min(...Object.values(p.price || { s: 99999 }).filter(Boolean));
          return min(a) - min(b);
        });
      } else if (filters.sort === 'price-high') {
        results.sort((a, b) => {
          const min = p => Math.min(...Object.values(p.price || { s: 0 }).filter(Boolean));
          return min(b) - min(a);
        });
      } else if (filters.sort === 'rating') {
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }

      setFilteredData(results);
      setIsLoading(false);
    };

    fetchAndFilter();
  }, [filters]);

  const updateFilter = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    // Sync to URL
    const params = new URLSearchParams();
    if (next.search)       params.set('search', next.search);
    if (next.area)         params.set('area', next.area);
    if (next.type !== 'all') params.set('type', next.type);
    if (next.gender !== 'all') params.set('gender', next.gender);
    if (next.budget !== 'all') params.set('budget', next.budget);
    if (next.sharing !== 'all') params.set('sharing', next.sharing);
    if (next.amenities.length > 0) params.set('amenities', next.amenities.join(','));
    if (next.verifiedOnly) params.set('verified', 'true');
    if (next.sort !== 'relevance') params.set('sort', next.sort);
    router.push(`/listings?${params.toString()}`, { scroll: false });
  };

  const toggleAmenity = (id) => {
    const next = filters.amenities.includes(id)
      ? filters.amenities.filter(a => a !== id)
      : [...filters.amenities, id];
    updateFilter('amenities', next);
  };

  const clearAll = () => {
    setFilters(DEFAULT_FILTERS);
    setAreaSearch('');
    router.push('/listings', { scroll: false });
  };

  const activeCount =
    (filters.area ? 1 : 0) +
    (filters.type !== 'all' ? 1 : 0) +
    (filters.gender !== 'all' ? 1 : 0) +
    (filters.budget !== 'all' ? 1 : 0) +
    (filters.sharing !== 'all' ? 1 : 0) +
    (filters.term !== 'all' ? 1 : 0) +
    filters.amenities.length +
    (filters.verifiedOnly ? 1 : 0);

  const filteredAreas = AREAS.filter(a =>
    a.toLowerCase().includes(areaSearch.toLowerCase())
  );

  // Active filter chips for top bar
  const activeChips = [];
  if (filters.area)            activeChips.push({ label: filters.area, clear: () => updateFilter('area', '') });
  if (filters.type !== 'all')  activeChips.push({ label: filters.type.toUpperCase(), clear: () => updateFilter('type', 'all') });
  if (filters.gender !== 'all') activeChips.push({ label: filters.gender.charAt(0).toUpperCase() + filters.gender.slice(1), clear: () => updateFilter('gender', 'all') });
  if (filters.budget !== 'all') {
    const b = BUDGET_RANGES.find(r => r.key === filters.budget);
    activeChips.push({ label: b?.label, clear: () => updateFilter('budget', 'all') });
  }
  if (filters.sharing !== 'all') activeChips.push({ label: filters.sharing.charAt(0).toUpperCase() + filters.sharing.slice(1) + ' Sharing', clear: () => updateFilter('sharing', 'all') });
  if (filters.term !== 'all') activeChips.push({ label: filters.term.charAt(0).toUpperCase() + filters.term.slice(1) + ' Plan', clear: () => updateFilter('term', 'all') });
  filters.amenities.forEach(id => {
    const am = AMENITIES_LIST.find(a => a.id === id);
    if (am) activeChips.push({ label: am.label, clear: () => toggleAmenity(id) });
  });
  if (filters.verifiedOnly) activeChips.push({ label: 'Verified Only', clear: () => updateFilter('verifiedOnly', false) });

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.container}>
          <h1 className={styles.title}>Find Your Perfect Stay</h1>
          <p className={styles.subtitle}>Premium PGs & Hostels in Greater Noida</p>
          <form className={styles.searchBar} onSubmit={e => { e.preventDefault(); updateFilter('search', filters.search); }}>
            <div className={styles.searchInputWrapper}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.searchIcon}>
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Search by name or area..."
                className={styles.searchInput}
                value={filters.search}
                onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              />
            </div>
            <button type="submit" className={styles.searchButton}>Search</button>
          </form>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.container}>
          <div className={styles.layout}>

            {/* ── SIDEBAR ── */}
            <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
              <div className={styles.sidebarHeader}>
                <span className={styles.sidebarTitle}>
                  🎛️ Filters {activeCount > 0 && <span className={styles.activeBadge}>{activeCount}</span>}
                </span>
                {activeCount > 0 && (
                  <button className={styles.clearBtn} onClick={clearAll}>Clear All</button>
                )}
                <button className={styles.closeSidebar} onClick={() => setSidebarOpen(false)}>✕</button>
              </div>

              {/* Area */}
              <div className={styles.filterBlock}>
                <div className={styles.filterBlockTitle}>📍 Location / Area</div>
                <input
                  type="text"
                  placeholder="Search area..."
                  className={styles.areaSearch}
                  value={areaSearch}
                  onChange={e => setAreaSearch(e.target.value)}
                />
                <div className={styles.areaList}>
                  <button
                    className={`${styles.areaItem} ${!filters.area ? styles.areaActive : ''}`}
                    onClick={() => updateFilter('area', '')}
                  >All Areas</button>
                  {filteredAreas.map(area => (
                    <button
                      key={area}
                      className={`${styles.areaItem} ${filters.area === area ? styles.areaActive : ''}`}
                      onClick={() => updateFilter('area', area)}
                    >{area}</button>
                  ))}
                </div>
              </div>

              <div className={styles.divider} />

              {/* Gender */}
              <div className={styles.filterBlock}>
                <div className={styles.filterBlockTitle}>👤 Gender Preference</div>
                <div className={styles.optionGroup}>
                  {[
                    { val: 'all',   label: 'Any' },
                    { val: 'boys',  label: '♂ Boys Only' },
                    { val: 'girls', label: '♀ Girls Only' },
                    { val: 'co-ed', label: '⚥ Co-ed / Unisex' },
                  ].map(o => (
                    <button
                      key={o.val}
                      className={`${styles.optionBtn} ${filters.gender === o.val ? styles.optionActive : ''}`}
                      onClick={() => updateFilter('gender', o.val)}
                    >{o.label}</button>
                  ))}
                </div>
              </div>

              <div className={styles.divider} />

              {/* Term / Duration */}
              <div className={styles.filterBlock}>
                <div className={styles.filterBlockTitle}>📅 Term / Duration</div>
                <div className={styles.optionGroup}>
                  {[
                    { val: 'all',     label: 'Any' },
                    { val: 'monthly', label: 'Monthly' },
                    { val: 'yearly',  label: 'Yearly' },
                  ].map(o => (
                    <button
                      key={o.val}
                      className={`${styles.optionBtn} ${filters.term === o.val ? styles.optionActive : ''}`}
                      onClick={() => updateFilter('term', o.val)}
                    >{o.label}</button>
                  ))}
                </div>
              </div>

              <div className={styles.divider} />

              {/* Property Type */}
              <div className={styles.filterBlock}>
                <div className={styles.filterBlockTitle}>🏠 Property Type</div>
                <div className={styles.optionGroup}>
                  {[
                    { val: 'all',    label: 'All' },
                    { val: 'PG',     label: 'PG' },
                    { val: 'Hostel', label: 'Hostel' },
                  ].map(o => (
                    <button
                      key={o.val}
                      className={`${styles.optionBtn} ${filters.type === o.val ? styles.optionActive : ''}`}
                      onClick={() => updateFilter('type', o.val)}
                    >{o.label}</button>
                  ))}
                </div>
              </div>

              <div className={styles.divider} />

              {/* Budget */}
              <div className={styles.filterBlock}>
                <div className={styles.filterBlockTitle}>💰 Budget (per month)</div>
                <div className={styles.optionGroup}>
                  {BUDGET_RANGES.map(b => (
                    <button
                      key={b.key}
                      className={`${styles.optionBtn} ${filters.budget === b.key ? styles.optionActive : ''}`}
                      onClick={() => updateFilter('budget', b.key)}
                    >{b.label}</button>
                  ))}
                </div>
              </div>

              <div className={styles.divider} />

              {/* Sharing Type */}
              <div className={styles.filterBlock}>
                <div className={styles.filterBlockTitle}>🛏️ Sharing Type</div>
                <div className={styles.optionGroup}>
                  {[
                    { val: 'all',    label: 'Any' },
                    { val: 'single', label: 'Single' },
                    { val: 'double', label: 'Double Sharing' },
                    { val: 'triple', label: 'Triple Sharing' },
                  ].map(o => (
                    <button
                      key={o.val}
                      className={`${styles.optionBtn} ${filters.sharing === o.val ? styles.optionActive : ''}`}
                      onClick={() => updateFilter('sharing', o.val)}
                    >{o.label}</button>
                  ))}
                </div>
              </div>

              <div className={styles.divider} />

              {/* Amenities */}
              <div className={styles.filterBlock}>
                <div className={styles.filterBlockTitle}>✨ Amenities</div>
                <div className={styles.amenitiesGrid}>
                  {AMENITIES_LIST.map(a => (
                    <button
                      key={a.id}
                      className={`${styles.amenityChip} ${filters.amenities.includes(a.id) ? styles.amenityActive : ''}`}
                      onClick={() => toggleAmenity(a.id)}
                    >
                      <span>{a.icon}</span> {a.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.divider} />

              {/* Other */}
              <div className={styles.filterBlock}>
                <div className={styles.filterBlockTitle}>🔖 Other</div>
                <label className={styles.toggleRow}>
                  <span>Verified Properties Only</span>
                  <div
                    className={`${styles.toggle} ${filters.verifiedOnly ? styles.toggleOn : ''}`}
                    onClick={() => updateFilter('verifiedOnly', !filters.verifiedOnly)}
                  >
                    <div className={styles.toggleThumb} />
                  </div>
                </label>
              </div>
            </aside>

            {/* Floating Filter FAB (mobile only) */}
            <button className={styles.filterFab} onClick={() => setSidebarOpen(true)}>
              🎛️ Filters {activeCount > 0 && <div className={styles.fabBadge}>{activeCount}</div>}
            </button>

            {/* Bottom Sheet Overlay */}
            {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}

            {/* Bottom Sheet Panel (mobile only) */}
            <div className={`${styles.bottomSheet} ${sidebarOpen ? styles.bottomSheetOpen : ''}`}>
              <div className={styles.bottomSheetDrag} />
              <div className={styles.bottomSheetHeader}>
                <span className={styles.bottomSheetTitle}>Filters {activeCount > 0 && `(${activeCount})`}</span>
                <button className={styles.bottomSheetClose} onClick={() => setSidebarOpen(false)}>✕</button>
              </div>
              
              <div className={styles.bottomSheetBody}>
                {/* Area */}
                <div className={styles.bsSection}>
                  <div className={styles.bsSectionTitle}>📍 Location / Area</div>
                  <input type="text" placeholder="Search area..." className={styles.bsAreaSearch} value={areaSearch} onChange={e => setAreaSearch(e.target.value)} />
                  <div className={styles.bsAreaScroll}>
                    <button className={`${styles.bsPill} ${!filters.area ? styles.bsPillActive : ''}`} onClick={() => updateFilter('area', '')}>All Areas</button>
                    {filteredAreas.map(area => (
                      <button key={area} className={`${styles.bsPill} ${filters.area === area ? styles.bsPillActive : ''}`} onClick={() => updateFilter('area', area)}>{area}</button>
                    ))}
                  </div>
                </div>

                {/* Gender */}
                <div className={styles.bsSection}>
                  <div className={styles.bsSectionTitle}>👤 Gender Preference</div>
                  <div className={styles.bsPills}>
                    {[
                      { val: 'all',   label: 'Any' },
                      { val: 'boys',  label: '♂ Boys Only' },
                      { val: 'girls', label: '♀ Girls Only' },
                      { val: 'co-ed', label: '⚥ Co-ed' },
                    ].map(o => (
                      <button key={o.val} className={`${styles.bsPill} ${filters.gender === o.val ? styles.bsPillActive : ''}`} onClick={() => updateFilter('gender', o.val)}>{o.label}</button>
                    ))}
                  </div>
                </div>

                {/* Property Type */}
                <div className={styles.bsSection}>
                  <div className={styles.bsSectionTitle}>🏠 Property Type</div>
                  <div className={styles.bsPills}>
                    {[
                      { val: 'all',    label: 'All' },
                      { val: 'PG',     label: 'PG' },
                      { val: 'Hostel', label: 'Hostel' },
                    ].map(o => (
                      <button key={o.val} className={`${styles.bsPill} ${filters.type === o.val ? styles.bsPillActive : ''}`} onClick={() => updateFilter('type', o.val)}>{o.label}</button>
                    ))}
                  </div>
                </div>

                {/* Budget */}
                <div className={styles.bsSection}>
                  <div className={styles.bsSectionTitle}>💰 Budget (per month)</div>
                  <div className={styles.bsPills}>
                    {BUDGET_RANGES.map(b => (
                      <button key={b.key} className={`${styles.bsPill} ${filters.budget === b.key ? styles.bsPillActive : ''}`} onClick={() => updateFilter('budget', b.key)}>{b.label}</button>
                    ))}
                  </div>
                </div>

                {/* Sharing Type */}
                <div className={styles.bsSection}>
                  <div className={styles.bsSectionTitle}>🛏️ Sharing Type</div>
                  <div className={styles.bsPills}>
                    {[
                      { val: 'all',    label: 'Any' },
                      { val: 'single', label: 'Single' },
                      { val: 'double', label: 'Double' },
                      { val: 'triple', label: 'Triple' },
                    ].map(o => (
                      <button key={o.val} className={`${styles.bsPill} ${filters.sharing === o.val ? styles.bsPillActive : ''}`} onClick={() => updateFilter('sharing', o.val)}>{o.label}</button>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div className={styles.bsSection}>
                  <div className={styles.bsSectionTitle}>✨ Amenities</div>
                  <div className={styles.bsGrid}>
                    {AMENITIES_LIST.map(a => (
                      <button key={a.id} className={`${styles.bsCheck} ${filters.amenities.includes(a.id) ? styles.bsCheckActive : ''}`} onClick={() => toggleAmenity(a.id)}>
                        <span>{a.icon}</span> {a.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Other */}
                <div className={styles.bsSection}>
                  <label className={styles.bsToggleRow}>
                    <span className={styles.bsToggleLabel}>🔖 Verified Properties Only</span>
                    <div className={`${styles.toggle} ${filters.verifiedOnly ? styles.toggleOn : ''}`} onClick={() => updateFilter('verifiedOnly', !filters.verifiedOnly)}>
                      <div className={styles.toggleThumb} />
                    </div>
                  </label>
                </div>
              </div>
              
              <div className={styles.bottomSheetFooter}>
                <button className={styles.bsClearBtn} onClick={clearAll}>Clear All</button>
                <button className={styles.bsShowBtn} onClick={() => setSidebarOpen(false)}>Show {filteredData.length} Results</button>
              </div>
            </div>

            {/* ── MAIN CONTENT ── */}
            <main className={styles.main}>
              {/* Top bar */}
              <div className={styles.topBar}>
                <div className={styles.topBarLeft}>
                  <button className={styles.filterToggleBtn} onClick={() => setSidebarOpen(true)}>
                    🎛️ Filters {activeCount > 0 && <span className={styles.activeBadge}>{activeCount}</span>}
                  </button>
                  <span className={styles.resultsCount}>
                    {isLoading ? 'Searching...' : `${filteredData.length} ${filteredData.length === 1 ? 'property' : 'properties'} found`}
                  </span>
                </div>
                <div className={styles.sortWrapper}>
                  <label className={styles.sortLabel}>Sort:</label>
                  <select
                    className={styles.sortSelect}
                    value={filters.sort}
                    onChange={e => updateFilter('sort', e.target.value)}
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>
              </div>

              {/* Active filter chips */}
              {activeChips.length > 0 && (
                <div className={styles.activeChips}>
                  {activeChips.map((chip, i) => (
                    <span key={i} className={styles.activeChip}>
                      {chip.label}
                      <button className={styles.chipRemove} onClick={chip.clear}>✕</button>
                    </span>
                  ))}
                  <button className={styles.clearAllChip} onClick={clearAll}>Clear All</button>
                </div>
              )}

              {/* Results Grid */}
              {!isLoading && filteredData.length === 0 ? (
                <div className={styles.noResults}>
                  <span className={styles.noResultsIllustration}>🏠</span>
                  <h3>No PGs found matching your filters</h3>
                  <p>We couldn't find any properties for the selected criteria.</p>
                  <p className={styles.noResultsHint}>Try broadening your search — remove some filters or search a different area.</p>
                  <div className={styles.noResultsActions}>
                    <button className={styles.resetButton} onClick={clearAll}>
                      Clear All Filters
                    </button>
                  </div>
                  <div className={styles.noResultsDivider}>or</div>
                  <div className={styles.notifySection}>
                    <div className={styles.notifyTitle}>🔔 Notify me when new PGs are added</div>
                    {!notifySent ? (
                      <form className={styles.notifyRow} onSubmit={e => { e.preventDefault(); setNotifySent(true); }}>
                        <input
                          type="text"
                          placeholder="WhatsApp or Email"
                          value={notifyContact}
                          onChange={e => setNotifyContact(e.target.value)}
                          required
                          className={styles.notifyInput}
                        />
                        <button type="submit" className={styles.notifyBtn}>💬 Notify Me</button>
                      </form>
                    ) : (
                      <div className={styles.notifySuccess}>🎉 We'll notify you when new PGs are added!</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className={`${styles.grid} ${isLoading ? styles.loading : ''}`}>
                  {filteredData.map((property, index) => (
                    <div key={property.id} className={styles.cardWrapper} style={{ animationDelay: `${index * 0.05}s` }}>
                      <PropertyCard property={property} />
                    </div>
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<div className={styles.pageLoading}>Loading properties...</div>}>
      <ListingsContent />
    </Suspense>
  );
}
