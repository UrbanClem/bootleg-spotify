/**
 * Inline SVG icon set.
 *
 * These replace the Font Awesome CDN the app used previously. Keeping icons
 * inline means they inherit `currentColor`, scale without a network request,
 * and stay crisp at any size.
 *
 * Playback icons are solid (as in Spotify); navigation icons are outlined.
 */

const Svg = ({ size = 24, children, fill = 'none', ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    {...rest}
  >
    {children}
  </svg>
);

/* --- Navigation --------------------------------------------------------- */

export const HomeIcon = ({ size, filled, ...r }) =>
  filled ? (
    <Svg size={size} fill="currentColor" stroke="none" {...r}>
      <path d="M12.5 2.4a1 1 0 0 1 .58.18l8 5.6A1 1 0 0 1 21.5 9v11a2 2 0 0 1-2 2h-4v-7h-7v7h-4a2 2 0 0 1-2-2V9a1 1 0 0 1 .42-.82l8-5.6a1 1 0 0 1 .58-.18Z" />
    </Svg>
  ) : (
    <Svg size={size} {...r}>
      <path d="M3 10.2 12 3l9 7.2V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-9.8Z" />
    </Svg>
  );

export const SearchIcon = ({ size, filled, ...r }) =>
  filled ? (
    <Svg size={size} fill="currentColor" stroke="none" {...r}>
      <path d="M10.5 3a7.5 7.5 0 1 1-4.7 13.35l-3.2 3.2a1 1 0 0 1-1.42-1.42l3.2-3.2A7.5 7.5 0 0 1 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z" />
    </Svg>
  ) : (
    <Svg size={size} {...r}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" />
    </Svg>
  );

export const LibraryIcon = ({ size, ...r }) => (
  <Svg size={size} {...r}>
    <path d="M4 4v16M9 4v16" />
    <path d="m14.5 5.2 4.9 15" />
  </Svg>
);

export const PlusIcon = ({ size, ...r }) => (
  <Svg size={size} {...r}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const ChevronLeft = ({ size = 24, ...r }) => (
  <Svg size={size} strokeWidth="2.4" {...r}>
    <path d="M15 5 8 12l7 7" />
  </Svg>
);

export const ChevronRight = ({ size = 24, ...r }) => (
  <Svg size={size} strokeWidth="2.4" {...r}>
    <path d="m9 5 7 7-7 7" />
  </Svg>
);

export const ChevronDown = ({ size = 24, ...r }) => (
  <Svg size={size} strokeWidth="2.4" {...r}>
    <path d="m5 9 7 7 7-7" />
  </Svg>
);

export const CloseIcon = ({ size = 24, ...r }) => (
  <Svg size={size} strokeWidth="2.2" {...r}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const MenuIcon = ({ size = 24, ...r }) => (
  <Svg size={size} strokeWidth="2.2" {...r}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
);

/* --- Playback ----------------------------------------------------------- */

export const PlayIcon = ({ size = 24, ...r }) => (
  <Svg size={size} fill="currentColor" stroke="none" {...r}>
    <path d="M7.5 4.9a1 1 0 0 1 1.52-.85l10.3 7.1a1 1 0 0 1 0 1.7l-10.3 7.1a1 1 0 0 1-1.52-.85V4.9Z" />
  </Svg>
);

export const PauseIcon = ({ size = 24, ...r }) => (
  <Svg size={size} fill="currentColor" stroke="none" {...r}>
    <path d="M6.5 4h3v16h-3zM14.5 4h3v16h-3z" />
  </Svg>
);

export const NextIcon = ({ size = 24, ...r }) => (
  <Svg size={size} fill="currentColor" stroke="none" {...r}>
    <path d="M5 5.5a1 1 0 0 1 1.6-.8l8 6.5a1 1 0 0 1 0 1.6l-8 6.5A1 1 0 0 1 5 18.5v-13Z" />
    <rect x="16.5" y="5" width="2.5" height="14" rx="1" />
  </Svg>
);

export const PrevIcon = ({ size = 24, ...r }) => (
  <Svg size={size} fill="currentColor" stroke="none" {...r}>
    <path d="M19 5.5a1 1 0 0 0-1.6-.8l-8 6.5a1 1 0 0 0 0 1.6l8 6.5a1 1 0 0 0 1.6-.8v-13Z" />
    <rect x="5" y="5" width="2.5" height="14" rx="1" />
  </Svg>
);

export const ShuffleIcon = ({ size = 24, ...r }) => (
  <Svg size={size} {...r}>
    <path d="M17 4h4v4M21 4l-7.5 7.5" />
    <path d="M17 20h4v-4M21 20l-4.2-4.2" />
    <path d="M3 4h3.2c1.2 0 2.3.6 3 1.6L15 16.4c.7 1 1.8 1.6 3 1.6H21" />
    <path d="M3 20h3.2c1.2 0 2.3-.6 3-1.6l1-1.4M14.2 8.4l.6-.8c.7-1 1.8-1.6 3-1.6H21" />
  </Svg>
);

export const RepeatIcon = ({ size = 24, ...r }) => (
  <Svg size={size} {...r}>
    <path d="M17 3l3 3-3 3" />
    <path d="M20 6H8a4 4 0 0 0-4 4v1" />
    <path d="M7 21l-3-3 3-3" />
    <path d="M4 18h12a4 4 0 0 0 4-4v-1" />
  </Svg>
);

export const VolumeIcon = ({ size = 24, level = 'high', ...r }) => (
  <Svg size={size} {...r}>
    <path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" />
    {level !== 'muted' && <path d="M15.5 9.2a4 4 0 0 1 0 5.6" />}
    {level === 'high' && <path d="M18.2 6.5a8 8 0 0 1 0 11" />}
  </Svg>
);

export const QueueIcon = ({ size = 24, ...r }) => (
  <Svg size={size} strokeWidth="1.7" {...r}>
    <path d="M3 6h11M3 11h11M3 16h7" />
    <path d="M17 12.5v7.2" />
    <circle cx="15" cy="19.5" r="1.8" />
    <path d="M17 12.5 21 11v6.5" />
  </Svg>
);

export const ShareIcon = ({ size = 24, ...r }) => (
  <Svg size={size} {...r}>
    <path d="M12 15V3.5" />
    <path d="m8 7 4-3.5L16 7" />
    <path d="M5 12.5v6A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-6" />
  </Svg>
);

/* --- Actions ------------------------------------------------------------ */

export const MoreIcon = ({ size = 24, ...r }) => (
  <Svg size={size} fill="currentColor" stroke="none" {...r}>
    <circle cx="5" cy="12" r="1.9" />
    <circle cx="12" cy="12" r="1.9" />
    <circle cx="19" cy="12" r="1.9" />
  </Svg>
);

export const TrashIcon = ({ size = 24, ...r }) => (
  <Svg size={size} {...r}>
    <path d="M4 6.5h16M9.5 6.5V4.8A1.3 1.3 0 0 1 10.8 3.5h2.4a1.3 1.3 0 0 1 1.3 1.3v1.7" />
    <path d="M6.5 6.5 7.4 19a1.6 1.6 0 0 0 1.6 1.5h6a1.6 1.6 0 0 0 1.6-1.5l.9-12.5" />
    <path d="M10.5 10.5v6M13.5 10.5v6" />
  </Svg>
);

export const EditIcon = ({ size = 24, ...r }) => (
  <Svg size={size} {...r}>
    <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
    <path d="M14 6.5 17.5 10" />
  </Svg>
);

export const CheckIcon = ({ size = 24, ...r }) => (
  <Svg size={size} strokeWidth="2.4" {...r}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </Svg>
);

export const VerifiedIcon = ({ size = 16, ...r }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...r}>
    <path d="M12 1.8l2.3 1.6 2.7-.1.9 2.6 2.2 1.6-.9 2.6.9 2.6-2.2 1.6-.9 2.6-2.7-.1L12 22.2l-2.3-1.6-2.7.1-.9-2.6-2.2-1.6.9-2.6-.9-2.6 2.2-1.6.9-2.6 2.7.1L12 1.8Z" />
    <path d="m8.4 12.2 2.5 2.5 4.8-4.9" stroke="#000" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* --- Meta / status ------------------------------------------------------ */

export const MusicIcon = ({ size = 24, ...r }) => (
  <Svg size={size} {...r}>
    <path d="M9 18V6l10-2v12" />
    <circle cx="6.5" cy="18" r="2.6" />
    <circle cx="16.5" cy="16" r="2.6" />
  </Svg>
);

export const AlbumIcon = ({ size = 24, ...r }) => (
  <Svg size={size} {...r}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="2.4" />
  </Svg>
);

export const ArtistIcon = ({ size = 24, ...r }) => (
  <Svg size={size} {...r}>
    <circle cx="12" cy="8.5" r="3.7" />
    <path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" />
  </Svg>
);

export const PlaylistIcon = ({ size = 24, ...r }) => (
  <Svg size={size} {...r}>
    <path d="M4 7h10M4 12h10M4 17h6" />
    <path d="M17.5 6.5v8.2" />
    <circle cx="15.8" cy="15" r="1.7" />
  </Svg>
);

export const UserIcon = ({ size = 24, ...r }) => (
  <Svg size={size} {...r}>
    <circle cx="12" cy="8.5" r="3.7" />
    <path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" />
  </Svg>
);

export const LogOutIcon = ({ size = 24, ...r }) => (
  <Svg size={size} {...r}>
    <path d="M9.5 4.5H6a1.5 1.5 0 0 0-1.5 1.5v12A1.5 1.5 0 0 0 6 19.5h3.5" />
    <path d="M15 8.5 18.5 12 15 15.5M18.5 12h-10" />
  </Svg>
);

export const GridIcon = ({ size = 24, ...r }) => (
  <Svg size={size} {...r}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
  </Svg>
);

export const ClockIcon = ({ size = 24, ...r }) => (
  <Svg size={size} {...r}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7v5.2l3.2 2" />
  </Svg>
);

export const CalendarIcon = ({ size = 24, ...r }) => (
  <Svg size={size} {...r}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
    <path d="M3.5 10h17M8.5 3.5V7M15.5 3.5V7" />
  </Svg>
);

export const WarningIcon = ({ size = 24, ...r }) => (
  <Svg size={size} {...r}>
    <path d="M12 4.5 21 19.5H3L12 4.5Z" />
    <path d="M12 10v4.2M12 17.2v.1" />
  </Svg>
);

export const InfoIcon = ({ size = 24, ...r }) => (
  <Svg size={size} {...r}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5.5M12 7.8v.1" />
  </Svg>
);

export const DiscIcon = ({ size = 24, ...r }) => (
  <Svg size={size} {...r}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="2.2" />
    <path d="M12 3.5a8.5 8.5 0 0 1 8.5 8.5" opacity="0.5" />
  </Svg>
);

export const SortIcon = ({ size = 24, ...r }) => (
  <Svg size={size} {...r}>
    <path d="M4 7h11M4 12h8M4 17h5" />
    <path d="M17 12v7M17 19l-2.5-2.5M17 19l2.5-2.5" />
  </Svg>
);
