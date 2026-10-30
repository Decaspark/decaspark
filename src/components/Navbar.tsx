import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BRAND_LOGO,
  FEATURED_CONTENT_ITEMS,
  NAVIGATION_CATEGORIES,
  POPULAR_SEARCH_LINKS,
  SEARCH_INDEX,
} from '../data/navigationData';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  CurvedRightArrowIcon,
  DiagonalArrowIcon,
  SearchIcon,
} from './Icons';
import './Navbar.css';

const MOBILE_MEDIA_QUERY = '(max-width: 939px)';

export const Navbar: React.FC = () => {
  const [activeL1Id, setActiveL1Id] = useState<string | null>(null);
  const [activeL2Id, setActiveL2Id] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeHitIndex, setActiveHitIndex] = useState<number>(-1);
  const [isMobileView, setIsMobileView] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.matchMedia(MOBILE_MEDIA_QUERY).matches : false
  );

  const headerRef = useRef<HTMLDivElement>(null);
  const navBarRef = useRef<HTMLDivElement>(null);
  const logoLinkRef = useRef<HTMLAnchorElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const searchToggleRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchSubmitRef = useRef<HTMLButtonElement>(null);
  const l1ButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const l2ButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const l3LinkRefs = useRef<Record<string, (HTMLAnchorElement | null)[]>>({});
  const scrollYRef = useRef<number>(0);

  const overlayActive = Boolean(activeL1Id || mobileMenuOpen || searchOpen);
  const isMobileL1Only = isMobileView && mobileMenuOpen && !activeL1Id && !searchOpen;

  // Match production viewport listener at 939px / 940px boundary
  useEffect(() => {
    const mql = window.matchMedia(MOBILE_MEDIA_QUERY);
    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobileView(e.matches);
      setActiveL1Id(null);
      setActiveL2Id(null);
      setMobileMenuOpen(false);
    };
    setIsMobileView(mql.matches);
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  // Match production lockBodyScroll / unlockBodyScroll (body.modal-open)
  useEffect(() => {
    const modalOpenClass = 'modal-open';
    if (overlayActive) {
      if (!document.body.classList.contains(modalOpenClass)) {
        scrollYRef.current = window.scrollY;
        document.body.classList.add(modalOpenClass);
        document.body.style.top = `-${scrollYRef.current}px`;
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
      }
    } else if (document.body.classList.contains(modalOpenClass)) {
      document.body.classList.remove(modalOpenClass);
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollYRef.current);
    }

    return () => {
      if (document.body.classList.contains(modalOpenClass)) {
        document.body.classList.remove(modalOpenClass);
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
      }
    };
  }, [overlayActive]);

  // Focus search input when search panel opens
  useEffect(() => {
    if (searchOpen) {
      const raf = window.requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
      return () => window.cancelAnimationFrame(raf);
    }
  }, [searchOpen]);

  // Global Escape fallback when focus is not inside a specific inner handler
  useEffect(() => {
    if (!overlayActive) return;

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' && event.key !== 'Esc') return;

      if (searchOpen) {
        event.preventDefault();
        setSearchOpen(false);
        setSearchQuery('');
        setActiveHitIndex(-1);
        searchToggleRef.current?.focus();
      } else if (activeL2Id) {
        event.preventDefault();
        const prevL2 = activeL2Id;
        setActiveL2Id(null);
        l2ButtonRefs.current[prevL2]?.focus();
      } else if (activeL1Id) {
        event.preventDefault();
        const prevL1 = activeL1Id;
        setActiveL1Id(null);
        setActiveL2Id(null);
        if (isMobileView) {
          l1ButtonRefs.current[prevL1]?.focus();
        } else {
          l1ButtonRefs.current[prevL1]?.focus();
        }
      } else if (mobileMenuOpen) {
        event.preventDefault();
        setMobileMenuOpen(false);
        mobileButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [overlayActive, searchOpen, activeL2Id, activeL1Id, mobileMenuOpen, isMobileView]);

  const closeAll = useCallback(() => {
    setActiveL1Id(null);
    setActiveL2Id(null);
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setSearchQuery('');
    setActiveHitIndex(-1);
  }, []);

  // Filter live Algolia search index on mid-query
  const trimmedQuery = searchQuery.trim();
  const filteredHits = useMemo(() => {
    if (!trimmedQuery) return [];
    const q = trimmedQuery.toLowerCase();
    return SEARCH_INDEX.filter(
      (entry) => entry.title.toLowerCase().includes(q) || entry.keywords.includes(q)
    ).slice(0, 8);
  }, [trimmedQuery]);

  // Reset active hit index when query changes
  useEffect(() => {
    setActiveHitIndex(-1);
  }, [trimmedQuery]);

  // Handlers
  const handleOverlayClick = () => {
    closeAll();
    searchToggleRef.current?.focus();
  };

  const handleHeaderBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    const related = event.relatedTarget as Node | null;
    if (related !== null && headerRef.current && !headerRef.current.contains(related)) {
      closeAll();
    }
  };

  const handleMobileMenuToggle = () => {
    if (mobileMenuOpen || activeL1Id) {
      setMobileMenuOpen(false);
      setActiveL1Id(null);
      setActiveL2Id(null);
    } else {
      setSearchOpen(false);
      setSearchQuery('');
      setActiveHitIndex(-1);
      setMobileMenuOpen(true);
    }
  };

  const handleL1Click = (l1Id: string) => {
    setSearchOpen(false);
    setSearchQuery('');
    setActiveHitIndex(-1);
    if (activeL1Id === l1Id) {
      setActiveL1Id(null);
      setActiveL2Id(null);
    } else {
      setActiveL1Id(l1Id);
      setActiveL2Id(null);
    }
  };

  const handleL2Click = (l2Id: string) => {
    setActiveL2Id((prev) => (prev === l2Id ? null : l2Id));
  };

  const handleMobileL2Back = (l1Id: string) => {
    l1ButtonRefs.current[l1Id]?.focus();
    setActiveL1Id(null);
    setActiveL2Id(null);
  };

  const handleMobileL3Back = (l2Id: string) => {
    setActiveL2Id(null);
    l2ButtonRefs.current[l2Id]?.focus();
  };

  const handleSearchToggleClick = () => {
    if (searchOpen) {
      setSearchOpen(false);
      setSearchQuery('');
      setActiveHitIndex(-1);
      searchToggleRef.current?.focus();
    } else {
      setActiveL1Id(null);
      setActiveL2Id(null);
      setMobileMenuOpen(false);
      setSearchOpen(true);
    }
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (activeHitIndex >= 0 && activeHitIndex < filteredHits.length) {
      window.location.href = filteredHits[activeHitIndex].href;
      return;
    }
    const targetUrl = trimmedQuery
      ? `https://www.mastercard.com/us/en/search-results.html?q=${encodeURIComponent(trimmedQuery)}`
      : 'https://www.mastercard.com/us/en/search-results.html';
    window.location.href = targetUrl;
  };

  // Keyboard navigation matching marts clientlib-site NavigationHeader & LevelMenuModule
  const handleLogoKeyDown = (event: React.KeyboardEvent<HTMLAnchorElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      if (searchOpen) {
        searchInputRef.current?.focus();
      } else {
        const firstL1 = NAVIGATION_CATEGORIES[0];
        if (firstL1) l1ButtonRefs.current[firstL1.id]?.focus();
      }
    }
  };

  const handleSearchToggleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (searchOpen) {
        searchInputRef.current?.focus();
      } else {
        const lastL1 = NAVIGATION_CATEGORIES[NAVIGATION_CATEGORIES.length - 1];
        if (lastL1) l1ButtonRefs.current[lastL1.id]?.focus();
      }
    }
  };

  const handleL1KeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    l1Index: number,
    l1Id: string
  ) => {
    const l1Item = NAVIGATION_CATEGORIES[l1Index];
    switch (event.key) {
      case 'ArrowRight':
      case 'Right': {
        event.preventDefault();
        if (l1Index + 1 < NAVIGATION_CATEGORIES.length) {
          l1ButtonRefs.current[NAVIGATION_CATEGORIES[l1Index + 1].id]?.focus();
        } else if (!isMobileView) {
          setActiveL1Id(null);
          setActiveL2Id(null);
          searchToggleRef.current?.focus();
        }
        break;
      }
      case 'ArrowLeft':
      case 'Left': {
        event.preventDefault();
        if (l1Index > 0) {
          l1ButtonRefs.current[NAVIGATION_CATEGORIES[l1Index - 1].id]?.focus();
        } else {
          setActiveL1Id(null);
          setActiveL2Id(null);
          setMobileMenuOpen(false);
          logoLinkRef.current?.focus();
        }
        break;
      }
      case 'ArrowDown':
      case 'Down': {
        event.preventDefault();
        setActiveL1Id(l1Id);
        setActiveL2Id(null);
        const firstL2 = l1Item.subcategories[0];
        if (firstL2) {
          window.requestAnimationFrame(() => {
            l2ButtonRefs.current[firstL2.id]?.focus();
          });
        }
        break;
      }
      case 'Escape':
      case 'Esc': {
        if (activeL1Id || mobileMenuOpen) {
          event.preventDefault();
          event.stopPropagation();
          setActiveL1Id(null);
          setActiveL2Id(null);
          if (isMobileView) {
            setMobileMenuOpen(false);
            mobileButtonRef.current?.focus();
          } else {
            l1ButtonRefs.current[l1Id]?.focus();
          }
        }
        break;
      }
    }
  };

  const handleL2KeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    l1Index: number,
    l2Index: number
  ) => {
    const l1Item = NAVIGATION_CATEGORIES[l1Index];
    const l2List = l1Item.subcategories;
    const l2Item = l2List[l2Index];

    switch (event.key) {
      case 'Escape':
      case 'Esc': {
        event.preventDefault();
        event.stopPropagation();
        setActiveL1Id(null);
        setActiveL2Id(null);
        l1ButtonRefs.current[l1Item.id]?.focus();
        break;
      }
      case 'ArrowUp':
      case 'Up': {
        event.preventDefault();
        if (l2Index > 0) {
          l2ButtonRefs.current[l2List[l2Index - 1].id]?.focus();
        } else {
          l1ButtonRefs.current[l1Item.id]?.focus();
        }
        break;
      }
      case 'ArrowDown':
      case 'Down': {
        event.preventDefault();
        setActiveL2Id(null);
        if (l2Index + 1 < l2List.length) {
          l2ButtonRefs.current[l2List[l2Index + 1].id]?.focus();
        } else if (l1Index + 1 < NAVIGATION_CATEGORIES.length) {
          const nextL1 = NAVIGATION_CATEGORIES[l1Index + 1];
          setActiveL1Id(nextL1.id);
          l1ButtonRefs.current[nextL1.id]?.focus();
        } else {
          setActiveL1Id(null);
          searchToggleRef.current?.focus();
        }
        break;
      }
      case 'ArrowLeft':
      case 'Left': {
        event.preventDefault();
        if (activeL2Id !== l2Item.id) {
          setActiveL2Id(null);
          if (l2Index > 0) {
            l2ButtonRefs.current[l2List[l2Index - 1].id]?.focus();
          } else {
            l1ButtonRefs.current[l1Item.id]?.focus();
          }
        }
        break;
      }
      case 'ArrowRight':
      case 'Right': {
        event.preventDefault();
        if (activeL2Id !== l2Item.id) {
          setActiveL2Id(l2Item.id);
        } else {
          l3LinkRefs.current[l2Item.id]?.[0]?.focus();
        }
        break;
      }
      case 'Tab': {
        if (!event.shiftKey && activeL2Id === l2Item.id) {
          event.preventDefault();
          l3LinkRefs.current[l2Item.id]?.[0]?.focus();
        }
        break;
      }
    }
  };

  const handleL3KeyDown = (
    event: React.KeyboardEvent<HTMLAnchorElement>,
    l1Index: number,
    l2Index: number,
    l3Index: number
  ) => {
    const l1Item = NAVIGATION_CATEGORIES[l1Index];
    const l2List = l1Item.subcategories;
    const l2Item = l2List[l2Index];
    const links = l3LinkRefs.current[l2Item.id] || [];
    const length = l2Item.items.length;
    const columnItemCount = Math.ceil(length / 2);

    switch (event.key) {
      case 'Escape':
      case 'Esc': {
        event.preventDefault();
        event.stopPropagation();
        setActiveL2Id(null);
        l2ButtonRefs.current[l2Item.id]?.focus();
        break;
      }
      case 'ArrowUp':
      case 'Up': {
        event.preventDefault();
        if (l3Index > 0) {
          links[l3Index - 1]?.focus();
        } else {
          l2ButtonRefs.current[l2Item.id]?.focus();
        }
        break;
      }
      case 'ArrowDown':
      case 'Down': {
        event.preventDefault();
        if (l3Index + 1 < length) {
          links[l3Index + 1]?.focus();
        } else if (l2Index + 1 < l2List.length) {
          setActiveL2Id(null);
          l2ButtonRefs.current[l2List[l2Index + 1].id]?.focus();
        }
        break;
      }
      case 'ArrowRight':
      case 'Right': {
        event.preventDefault();
        if (l3Index + 1 < columnItemCount && links[l3Index + columnItemCount]) {
          links[l3Index + columnItemCount]?.focus();
        } else if (l3Index + 1 === columnItemCount) {
          links[length - 1]?.focus();
        } else if (l2Index + 1 < l2List.length) {
          setActiveL2Id(null);
          l2ButtonRefs.current[l2List[l2Index + 1].id]?.focus();
        }
        break;
      }
      case 'ArrowLeft':
      case 'Left': {
        event.preventDefault();
        if (l3Index + 1 > columnItemCount) {
          links[l3Index - columnItemCount]?.focus();
        } else {
          l2ButtonRefs.current[l2Item.id]?.focus();
        }
        break;
      }
    }
  };

  const handleSearchInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape' || event.key === 'Esc') {
      event.preventDefault();
      event.stopPropagation();
      setSearchOpen(false);
      setSearchQuery('');
      setActiveHitIndex(-1);
      searchToggleRef.current?.focus();
      return;
    }

    if (
      event.key === 'ArrowRight' &&
      event.currentTarget.selectionStart === event.currentTarget.value.length
    ) {
      event.preventDefault();
      searchToggleRef.current?.focus();
      return;
    }

    if (event.key === 'ArrowLeft' && event.currentTarget.selectionStart === 0 && !isMobileView) {
      event.preventDefault();
      logoLinkRef.current?.focus();
      return;
    }

    if (!trimmedQuery) return;

    if (event.key === 'ArrowDown' || event.key === 'Down') {
      event.preventDefault();
      if (filteredHits.length === 0) {
        setActiveHitIndex(-1);
        searchSubmitRef.current?.focus();
      } else if (activeHitIndex < filteredHits.length - 1) {
        setActiveHitIndex(activeHitIndex + 1);
      } else {
        setActiveHitIndex(-1);
        searchSubmitRef.current?.focus();
      }
    } else if (event.key === 'ArrowUp' || event.key === 'Up') {
      event.preventDefault();
      if (activeHitIndex > 0) {
        setActiveHitIndex(activeHitIndex - 1);
      } else if (activeHitIndex === 0) {
        setActiveHitIndex(-1);
      } else {
        searchSubmitRef.current?.focus();
      }
    }
  };

  const handleSearchSubmitKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowUp' || event.key === 'Up') {
      event.preventDefault();
      searchInputRef.current?.focus();
      if (filteredHits.length > 0) {
        setActiveHitIndex(filteredHits.length - 1);
      }
    } else if (event.key === 'ArrowDown' || event.key === 'Down') {
      event.preventDefault();
      searchInputRef.current?.focus();
      setActiveHitIndex(-1);
    }
  };

  const headerClasses = [
    'navigation-header',
    overlayActive ? 'active' : '',
    searchOpen ? 'search' : '',
    isMobileL1Only ? 'mobile-l1-only' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const activeDescendantId =
    activeHitIndex >= 0 && activeHitIndex < filteredHits.length
      ? `autocomplete-hit-${activeHitIndex}`
      : '';

  return (
    <header className="experiencefragment">
      <div className="cmp-experiencefragment cmp-experiencefragment--header">
        <div ref={headerRef} className={headerClasses} onBlur={handleHeaderBlur}>
          <div
            ref={navBarRef}
            className={`navigation-bar${overlayActive ? ' active' : ''}`}
          >
            {/* Left: Decaspark Brand Emblem */}
            <div className="navigation-bar__logo-wrapper">
              <div className="navigation-bar__logo navigation-bar__primary-logo">
                <a
                  ref={logoLinkRef}
                  href={BRAND_LOGO.href}
                  aria-label="Decaspark Home"
                  onKeyDown={handleLogoKeyDown}
                >
                  <img
                    src={BRAND_LOGO.src}
                    alt={BRAND_LOGO.alt}
                  />
                </a>
              </div>
            </div>

            {/* Center: Primary Navigation + Mega-Menu + Mobile Drawer */}
            <nav className="navigation-bar__main" aria-label="Main navigation">
              <button
                ref={mobileButtonRef}
                type="button"
                className="mobile-menu-button"
                aria-expanded={mobileMenuOpen || Boolean(activeL1Id)}
                aria-controls="mobileMenu"
                onClick={handleMobileMenuToggle}
              >
                <span className="mobile-menu-button-text">
                  {mobileMenuOpen || activeL1Id ? 'Close Menu' : 'Open Menu'}
                </span>
                <span className="mobile-menu-button-indicator" aria-hidden="true" />
              </button>

              <div className="l1-container">
                <div
                  id="mobileMenu"
                  className="mobile-menu"
                  aria-hidden={isMobileView ? !mobileMenuOpen : false}
                >
                  <ul>
                    {NAVIGATION_CATEGORIES.map((l1, l1Index) => {
                      const isL1Open = activeL1Id === l1.id;
                      const l2ContainerId = `l2-${l1.id}`;
                      const l1ButtonId = `l1-btn-${l1.id}`;
                      return (
                        <li key={l1.id} className="nav-item">
                          <button
                            ref={(el) => {
                              l1ButtonRefs.current[l1.id] = el;
                            }}
                            id={l1ButtonId}
                            type="button"
                            aria-expanded={isL1Open}
                            aria-controls={l2ContainerId}
                            onClick={() => handleL1Click(l1.id)}
                            onKeyDown={(e) => handleL1KeyDown(e, l1Index, l1.id)}
                          >
                            {l1.label}
                            <span className="l1-mobile-chevron" aria-hidden="true">
                              <ChevronRightIcon size={20} />
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              {/* Level 2 & Level 3 Panels */}
              <div className="l2-wrapper">
                {NAVIGATION_CATEGORIES.map((l1, l1Index) => {
                  const isL1Open = activeL1Id === l1.id;
                  const l2ContainerId = `l2-${l1.id}`;
                  const l1ButtonId = `l1-btn-${l1.id}`;

                  return (
                    <div
                      key={l1.id}
                      id={l2ContainerId}
                      className="l2-container"
                      aria-hidden={!isL1Open}
                      aria-labelledby={l1ButtonId}
                    >
                      <button
                        type="button"
                        className="mobile-back-button"
                        tabIndex={activeL2Id ? -1 : undefined}
                        onClick={() => handleMobileL2Back(l1.id)}
                      >
                        <span className="mobile-back-chevron" aria-hidden="true">
                          <ChevronLeftIcon size={16} />
                        </span>
                        All
                      </button>
                      <span className="mobile-navigation-title">{l1.label}</span>

                      <div className="nav-section">
                        <div className="l2-left-rail">
                          <ul role="menu" aria-label={l1.label}>
                            {l1.subcategories.map((l2, l2Index) => {
                              const isL2Open = isL1Open && activeL2Id === l2.id;
                              const l3ContainerId = `l3-${l2.id}`;
                              const skipTab =
                                isL1Open && activeL2Id !== null && activeL2Id !== l2.id;

                              return (
                                <li
                                  key={l2.id}
                                  className="nav-section-heading"
                                  role="none"
                                >
                                  <button
                                    ref={(el) => {
                                      l2ButtonRefs.current[l2.id] = el;
                                    }}
                                    id={`l2-btn-${l2.id}`}
                                    type="button"
                                    role="menuitem"
                                    aria-expanded={isL2Open}
                                    aria-controls={l3ContainerId}
                                    tabIndex={!isL1Open || skipTab ? -1 : 0}
                                    onClick={() => handleL2Click(l2.id)}
                                    onKeyDown={(e) => handleL2KeyDown(e, l1Index, l2Index)}
                                  >
                                    <span>{l2.label}</span>
                                    <span className="l2-chevron" aria-hidden="true">
                                      <ChevronRightIcon size={14} />
                                    </span>
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        </div>

                        <div className="l2-right-rail">
                          {l1.subcategories.map((l2, l2Index) => {
                            const isL2Open = isL1Open && activeL2Id === l2.id;
                            const l3ContainerId = `l3-${l2.id}`;

                            return (
                              <div
                                key={l2.id}
                                id={l3ContainerId}
                                className="l3-container"
                                aria-hidden={!isL2Open}
                              >
                                <div className="nav-sub-section">
                                  <button
                                    type="button"
                                    className="mobile-back-button"
                                    tabIndex={isL2Open ? 0 : -1}
                                    onClick={() => handleMobileL3Back(l2.id)}
                                  >
                                    <span className="mobile-back-chevron" aria-hidden="true">
                                      <ChevronLeftIcon size={16} />
                                    </span>
                                    {l1.label}
                                  </button>
                                  <span className="mobile-navigation-title">{l2.label}</span>

                                  <ul role="menu" aria-label={l2.label}>
                                    {l2.items.map((l3, l3Index) => (
                                      <li key={`${l2.id}-${l3Index}`} role="none">
                                        <div className="link-teaser forced-light-mode">
                                          <div className="cmp-link-teaser">
                                            <a
                                              ref={(el) => {
                                                if (!l3LinkRefs.current[l2.id]) {
                                                  l3LinkRefs.current[l2.id] = [];
                                                }
                                                l3LinkRefs.current[l2.id][l3Index] = el;
                                              }}
                                              className="cmp-link-teaser__cta"
                                              role="menuitem"
                                              href={l3.href}
                                              target={l3.external ? '_blank' : undefined}
                                              rel={
                                                l3.external ? 'noopener noreferrer' : undefined
                                              }
                                              tabIndex={isL2Open ? 0 : -1}
                                              onKeyDown={(e) =>
                                                handleL3KeyDown(e, l1Index, l2Index, l3Index)
                                              }
                                            >
                                              <div className="cmp-link-teaser__title-container">
                                                <span className="cmp-link-teaser__title">
                                                  {l3.label}
                                                </span>
                                              </div>
                                              {l3.external && (
                                                <>
                                                  <DiagonalArrowIcon
                                                    size={14}
                                                    className="mc-external-icon"
                                                  />
                                                  <span className="sr-only">
                                                    opens in a new tab
                                                  </span>
                                                </>
                                              )}
                                            </a>
                                          </div>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </nav>

            {/* Right: Search Toggle & Algolia Search Content */}
            <div className="navigation-bar__search">
              <div
                id="search-content"
                className="navigation-bar__search-content"
                aria-hidden={!searchOpen}
              >
                <div className="instant-search-comp__searchbox-wrap">
                  <div id="autocomplete">
                    <div
                      className="aa-Autocomplete"
                      role="combobox"
                      aria-expanded={searchOpen}
                      aria-haspopup="listbox"
                      aria-owns="autocomplete-0-list"
                    >
                      <form
                        className="aa-Form"
                        action="https://www.mastercard.com/us/en/search-results.html"
                        role="search"
                        noValidate
                        onSubmit={handleSearchSubmit}
                      >
                        <div className="aa-InputWrapperPrefix">
                          <label
                            className="aa-Label"
                            htmlFor="autocomplete-0-input"
                            id="autocomplete-0-label"
                          >
                            <button className="aa-SubmitButton" type="submit" title="Submit">
                              <SearchIcon size={16} />
                            </button>
                          </label>
                        </div>
                        <div className="aa-InputWrapper">
                          <input
                            ref={searchInputRef}
                            className="aa-Input"
                            id="autocomplete-0-input"
                            type="search"
                            placeholder="Search"
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck={false}
                            maxLength={512}
                            aria-autocomplete="list"
                            aria-controls="autocomplete-0-list"
                            aria-labelledby="autocomplete-0-label"
                            aria-activedescendant={activeDescendantId}
                            tabIndex={searchOpen ? 0 : -1}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearchInputKeyDown}
                          />
                        </div>
                        <div className="aa-InputWrapperSuffix">
                          <button
                            className="aa-ClearButton"
                            type="reset"
                            title="Clear"
                            hidden={!searchQuery}
                            onClick={() => {
                              setSearchQuery('');
                              searchInputRef.current?.focus();
                            }}
                          >
                            <CloseIcon size={14} />
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>

                <div className="search-content">
                  {/* Pre-Query State: "What are you looking for?" + "Featured Content" */}
                  <div className="plugin_prequery pre-query" hidden={trimmedQuery.length > 0}>
                    <div className="pre-query__grid">
                      <div className="pre-query__left">
                        <div className="title mccom-title__pre">
                          <div className="cmp-title">
                            <h2 className="cmp-title__text">
                              <span className="cmp-pretitle-icon" aria-hidden="true" />
                              What are you looking for?
                            </h2>
                          </div>
                        </div>

                        {POPULAR_SEARCH_LINKS.map((item) => (
                          <div key={item.label} className="button mccom-cta__tertiary">
                            <a
                              className="cmp-button"
                              href={item.href}
                              tabIndex={searchOpen && trimmedQuery.length === 0 ? 0 : -1}
                            >
                              <span className="cmp-button__text">{item.label}</span>
                            </a>
                          </div>
                        ))}
                      </div>

                      <div className="pre-query__right">
                        <div className="title mccom-title__pre">
                          <div className="cmp-title">
                            <h2 className="cmp-title__text">
                              <span className="cmp-pretitle-icon" aria-hidden="true" />
                              Featured Content
                            </h2>
                          </div>
                        </div>

                        {FEATURED_CONTENT_ITEMS.map((item) => (
                          <div key={item.title} className="teaser mccom-side-bar">
                            <div className="cmp-teaser">
                              <a
                                className="cmp-teaser__link"
                                href={item.href}
                                target={item.external ? '_blank' : undefined}
                                rel={item.external ? 'noopener noreferrer' : undefined}
                                tabIndex={searchOpen && trimmedQuery.length === 0 ? 0 : -1}
                              >
                                <div className="cmp-teaser__content">
                                  <h3 className="cmp-teaser__title">{item.title}</h3>
                                  <div className="cmp-teaser__description">
                                    <p>{item.description}</p>
                                  </div>
                                </div>
                                {item.external && (
                                  <>
                                    <DiagonalArrowIcon
                                      size={14}
                                      className="mc-external-icon"
                                    />
                                    <span className="sr-only">opens in a new tab</span>
                                  </>
                                )}
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Mid-Query State: Algolia Results List + View Results */}
                  <div className="mid-query" hidden={trimmedQuery.length === 0}>
                    <div className="mid-query__container cmp-container">
                      {filteredHits.length > 0 ? (
                        <div className="aa-Panel">
                          <div className="default-state">
                            <ul
                              id="autocomplete-0-list"
                              className="aa-List"
                              role="listbox"
                              aria-label="Search suggestions"
                            >
                              {filteredHits.map((hit, idx) => (
                                <li
                                  key={hit.href}
                                  id={`autocomplete-hit-${idx}`}
                                  className="aa-Item"
                                  role="option"
                                  aria-selected={activeHitIndex === idx}
                                  data-active={activeHitIndex === idx ? 'true' : 'false'}
                                >
                                  <span className="aa-ItemIcon" aria-hidden="true">
                                    <CurvedRightArrowIcon size={12} />
                                  </span>
                                  <div className="algolia-analytics">
                                    <a
                                      className="hit-card"
                                      href={hit.href}
                                      tabIndex={searchOpen && trimmedQuery.length > 0 ? 0 : -1}
                                    >
                                      <span>{hit.title}</span>
                                    </a>
                                  </div>
                                </li>
                              ))}
                            </ul>
                            <button
                              ref={searchSubmitRef}
                              type="button"
                              className="search-submit"
                              tabIndex={searchOpen && trimmedQuery.length > 0 ? 0 : -1}
                              onClick={handleSearchSubmit}
                              onKeyDown={handleSearchSubmitKeyDown}
                            >
                              View Results
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="aa-Panel">
                          <p className="no-results-header">No Results Found.</p>
                          <p className="no-results-body">
                            Please try again with a different search query.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <button
                ref={searchToggleRef}
                id="search-toggle"
                type="button"
                className="search-toggle"
                aria-label={searchOpen ? 'Close search' : 'Open search'}
                aria-expanded={searchOpen}
                aria-controls="search-content"
                onClick={handleSearchToggleClick}
                onKeyDown={handleSearchToggleKeyDown}
              >
                <span className="toggle-icon search-icon" aria-hidden="true">
                  <SearchIcon size={14} />
                </span>
                <span className="toggle-icon close-icon" aria-hidden="true">
                  <CloseIcon size={14} />
                </span>
              </button>
            </div>
          </div>

          <div
            className={`navigation-overlay${overlayActive ? ' active' : ''}`}
            aria-hidden="true"
            onClick={handleOverlayClick}
          />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
