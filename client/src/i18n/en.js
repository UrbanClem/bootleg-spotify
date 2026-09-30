/**
 * English strings — the source of truth for the catalogue.
 *
 * `es.js` must define exactly the same keys; `client/ssr-smoke.jsx` fails the
 * build if the two ever drift apart.
 *
 * Entry shapes:
 *   'plain string'
 *   { one: '...', other: '...' }   plural, picked with t(key, { n: count })
 *
 * Interpolation: {name} is replaced by vars.name. A placeholder with no
 * matching var is left untouched so the omission is visible rather than silent.
 */
export default {
  common: {
    cancel: 'Cancel',
    save: 'Save',
    saving: 'Saving…',
    create: 'Create',
    creating: 'Creating…',
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    close: 'Close',
    gotIt: 'Got it',
    loading: 'Loading',
    unknown: '—',
    you: 'You',
    yes: 'Yes',
    no: 'No'
  },

  nav: {
    home: 'Home',
    search: 'Search',
    library: 'Your library',
    createPlaylist: 'Create playlist',
    mainNavigation: 'Main navigation',
    seeWholeLibrary: 'See your whole library',
    openMenu: 'Open menu',
    back: 'Back',
    forward: 'Forward',
    accountMenu: 'Account menu',
    account: 'Account',
    adminPanel: 'Admin panel',
    signOut: 'Sign out',
    guest: 'Guest',
    language: 'Language'
  },

  role: {
    admin: 'Admin',
    user: 'User'
  },

  plural: {
    song: { one: '{n} song', other: '{n} songs' },
    album: { one: '{n} album', other: '{n} albums' },
    artist: { one: '{n} artist', other: '{n} artists' },
    playlist: { one: '{n} playlist', other: '{n} playlists' },
    follower: { one: '{n} follower', other: '{n} followers' },
    minute: { one: '{n} min', other: '{n} min' }
  },

  kind: {
    album: 'Album',
    artist: 'Artist',
    playlist: 'Playlist'
  },

  label: {
    song: 'Song',
    album: 'Album',
    artist: 'Artist',
    songs: 'Songs',
    albums: 'Albums',
    artists: 'Artists'
  },

  player: {
    idle: 'Nothing playing',
    idleHint: 'Pick a song to get started',
    play: 'Play',
    pause: 'Pause',
    previous: 'Previous track',
    next: 'Next track',
    shuffle: 'Shuffle',
    repeat: 'Repeat',
    repeatOff: 'Repeat: off',
    repeatAll: 'Repeat: whole queue',
    repeatOne: 'Repeat: current song',
    volume: 'Volume',
    mute: 'Mute',
    unmute: 'Unmute',
    queue: 'Playback queue',
    closeQueue: 'Close queue',
    queuePanel: 'Playback queue',
    nowPlaying: 'Now playing',
    upNext: 'Up next',
    queueEmptyIdle: 'Nothing is playing.',
    queueEmptyHint: 'The queue is empty. Add songs from any list.',
    noAudio: 'No audio file loaded',
    progress: 'Playback progress',
    playNext: 'Play next'
  },

  track: {
    play: 'Play {title}',
    addToQueue: 'Add {title} to the queue',
    addToQueueShort: 'Add to queue',
    moreOptions: 'More options for {title}',
    explicit: 'Contains explicit lyrics',
    unknownArtist: 'Unknown artist',
    title: 'Title'
  },

  shelf: {
    seeAll: 'Show all'
  },

  card: {
    verified: 'Verified',
    verifiedArtist: 'Verified artist',
    pause: 'Pause {title}',
    play: 'Play {title}'
  },

  home: {
    loadError: 'Could not load your home page.',
    subtitle: 'Everything you like, all in one place.',
    searchMusic: 'Search music',
    madeForYou: 'Made for you',
    madeForYouSub: 'A pick from the catalogue',
    yourPlaylists: 'Your playlists',
    newAlbums: 'New albums',
    artistsYouLike: 'Artists you might like',
    popularNow: 'Popular right now',
    emptyTitle: 'Your library is empty',
    emptyText: 'Create your first playlist or explore the available albums.',
    browseCatalogue: 'Browse the catalogue'
  },

  greeting: {
    morning: 'Good morning',
    afternoon: 'Good afternoon',
    evening: 'Good evening',
    night: 'Good evening'
  },

  search: {
    placeholder: 'What do you want to listen to?',
    label: 'Search',
    clear: 'Clear search',
    failed: 'Search failed.',
    browseByGenre: 'Browse by genre',
    noResults: 'No results for "{query}"',
    noResultsText: 'Try a different artist, album or genre.',
    songs: 'Songs',
    albums: 'Albums',
    artists: 'Artists',
    seeAllSongs: 'See all songs',
    seeAllAlbums: 'See all albums',
    seeAllArtists: 'See all artists'
  },

  tab: {
    all: 'All'
  },

  library: {
    title: 'Your library',
    filterPlaceholder: 'Filter by name',
    filterLabel: 'Filter playlists',
    sortBy: 'Sort by',
    sortRecent: 'Recently added',
    sortName: 'Name',
    sortSongs: 'Number of songs',
    count: { one: '{n} playlist', other: '{n} playlists' },
    loadError: 'Could not load your library.',
    emptyTitle: 'You have no playlists yet',
    emptyText: 'Use "Create playlist" in the sidebar to start one.',
    browseMusic: 'Explore music',
    noResults: 'No results',
    noResultsText: 'No playlist matches "{query}".',
    emptyPlaylist: 'Empty',
    sidebarEmpty: 'You have no playlists yet.',
    sidebarSignedOut: 'Sign in to see your library.'
  },

  album: {
    notFound: 'Album not found',
    loadError: 'Could not load the album.',
    searchMusic: 'Search music',
    noAudioYet: 'No audio uploaded yet',
    emptyTitle: 'This album has no songs yet',
    emptyText: 'Add songs from the admin panel.'
  },

  artist: {
    notFound: 'Artist not found',
    loadError: 'Could not load the artist.',
    searchArtists: 'Search artists',
    followers: '{n} followers',
    onPlatformSince: 'On the platform since {date}',
    emptyTitle: 'This artist has no songs yet',
    emptyText: 'Add songs from the admin panel.',
    popular: 'Popular',
    playPopular: 'Play popular',
    addAllToQueue: 'Add all to the queue',
    seeLess: 'Show less',
    seeAllSongs: 'See all {n} songs',
    appearsOn: 'Appears on',
    appearsOnSubtitle: '{year} · {count}',
    generic: 'Artist'
  },

  playlist: {
    notFound: 'Playlist not found',
    loadError: 'Could not load the playlist.',
    goToLibrary: 'Go to your library',
    yourAccount: 'Your account',
    createdOn: 'Created on {date}',
    emptyTitle: 'This playlist is empty',
    emptyText: 'Use the "Add songs" button to start filling it.',
    editDetails: 'Edit details',
    addSongs: 'Add songs',
    deletePlaylist: 'Delete playlist',
    options: 'Playlist options',
    ownerOnly: 'Only the owner can edit it.',
    play: 'Play',
    addToQueue: 'Add to queue',
    removeFromPlaylist: 'Remove from playlist',
    editModalTitle: 'Edit playlist details',
    nameEmpty: 'The name cannot be empty.',
    saveFailed: 'Could not save.',
    addSongsModal: 'Add songs',
    filterPlaceholder: 'Filter by title or artist',
    filterLabel: 'Filter songs',
    noSongsToAdd: 'There are no songs to add.',
    addSongFailed: 'Could not add the song.',
    removeSongError: 'Could not remove the song.',
    removeError: 'Could not delete the playlist.',
    removeConfirm: 'Delete "{name}"? This cannot be undone.'
  },

  profile: {
    admin: 'Administrator',
    user: 'User',
    memberSince: 'Member since {date}',
    sinceLabel: 'Member since',
    accountInfo: 'Account details',
    name: 'Name',
    email: 'Email',
    birthDate: 'Date of birth',
    country: 'Country',
    countryPlaceholder: 'Spain',
    saveChanges: 'Save changes',
    saved: 'Profile updated.',
    saveError: 'Could not save the profile.',
    accountType: 'Account type',
    playlists: 'Playlists',
    savedSongs: 'Saved songs'
  },

  auth: {
    signIn: 'Sign in',
    signInTagline: 'Keep listening where you left off.',
    email: 'Email',
    emailPlaceholder: 'you@email.com',
    password: 'Password',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    signingIn: 'Signing in…',
    failed: 'We could not sign you in. Check your details.',
    noAccount: 'No account yet?',
    registerCta: 'Sign up for Bootleg',
    demoAccount: 'Demo account',
    createAccount: 'Create your account',
    createTagline: 'Start listening in seconds.',
    yourName: 'Your name',
    namePlaceholder: 'Your name',
    passwordPlaceholder: 'At least 6 characters',
    strengthWeak: 'Weak',
    strengthNormal: 'Fair',
    strengthGood: 'Good',
    strengthStrong: 'Strong',
    tooShort: 'The password must be at least 6 characters.',
    creating: 'Creating account…',
    register: 'Sign up',
    haveAccount: 'Already have an account?',
    signInCta: 'Sign in',
    createFailed: 'We could not create the account. Please try again.'
  },

  createPlaylist: {
    title: 'Create playlist',
    nameRequired: 'Give the playlist a name.',
    nameLabel: 'Name',
    namePlaceholder: 'My playlist',
    descriptionLabel: 'Description',
    descriptionPlaceholder: "What's this playlist about?",
    private: 'Private',
    failed: 'Could not create the playlist.'
  },

  field: {
    name: 'Name',
    stageName: 'Stage name',
    title: 'Title',
    description: 'Description',
    artist: 'Artist',
    album: 'Album',
    genre: 'Genre',
    genrePlaceholder: 'Indie rock',
    duration: 'Duration (seconds)',
    releaseDate: 'Release date',
    signUpDate: 'Sign-up date',
    lyrics: 'Lyrics',
    explicitContent: 'Explicit content',
    verifiedArtist: 'Verified artist',
    audioFile: 'Audio file',
    currentFile: 'Current: {file}',
    audioHint: 'MP3, WAV, OGG or M4A. Max 50 MB.',
    cover: 'Cover',
    currentCover: 'Current cover',
    imageHint: 'JPG, PNG, GIF or WEBP. Max 10 MB.',
    photo: 'Profile photo',
    currentPhoto: 'Current photo',
    select: 'Select…',
    noAlbum: 'No album',
    selectArtist: 'Select an artist.',
    titleRequired: 'The title is required.',
    nameRequired: 'The name is required.'
  },

  modal: {
    close: 'Close'
  },

  feedback: {
    closeAlert: 'Dismiss message',
    loading: 'Loading'
  },

  share: {
    copy: 'Share',
    copied: 'Link copied',
    copyTitle: 'Copy link'
  },

  admin: {
    title: 'Administration',
    sections: 'Admin sections',
    overview: 'Overview',
    songs: 'Songs',
    albums: 'Albums',
    artists: 'Artists',
    users: 'Users',
    manage: 'Manage →',
    loadError: 'Could not load the panel.',
    withAudioTitle: 'Songs with audio',
    withAudioOf: 'of {n}',
    withAudioHint:
      'Songs without a file cannot be played yet. Upload the audio from the Songs section.',
    manageSongs: 'Manage songs',
    recentUsers: 'Recent users',
    noData: 'No data.',
    filterSongs: 'Filter songs',
    filterAlbums: 'Filter albums',
    filterArtists: 'Filter artists',
    filterUsers: 'Filter users',
    withAudioCount: '{n} with audio uploaded',
    withCoverCount: '{n} with a cover',
    verifiedCount: '{n} verified',
    newSong: 'New song',
    newAlbum: 'New album',
    newArtist: 'New artist',
    editSong: 'Edit "{name}"',
    editAlbum: 'Edit "{name}"',
    editArtist: 'Edit "{name}"',
    editUser: 'Edit "{name}"',
    noSongs: 'No songs',
    noSongsHint: 'Create the first one to start the catalogue.',
    noAlbums: 'No albums',
    noArtists: 'No artists',
    noUsers: 'No users',
    audioReady: 'Ready',
    audioMissing: 'No audio',
    columnName: 'Name',
    columnEmail: 'Email',
    columnAccount: 'Account',
    columnCountry: 'Country',
    columnSignedUp: 'Signed up',
    columnArtist: 'Artist',
    columnAlbum: 'Album',
    columnGenre: 'Genre',
    columnDate: 'Date',
    columnSongs: 'Songs',
    columnCover: 'Cover',
    columnAudio: 'Audio',
    columnDuration: 'Duration',
    columnFollowers: 'Followers',
    columnVerified: 'Verified',
    columnPhoto: 'Photo',
    editAction: 'Edit {name}',
    deleteAction: 'Delete {name}',
    confirmDeleteSong: 'Delete "{name}"? This cannot be undone.',
    confirmDeleteAlbum: 'Delete the album "{name}"?',
    confirmDeleteArtist: 'Delete the artist "{name}"?',
    confirmDeleteUser: 'Delete "{name}"?',
    songCreated: 'Song created.',
    songUpdated: 'Song updated.',
    songDeleted: 'Song deleted.',
    songDeleteError: 'Could not delete.',
    songSaveError: 'Could not save the song.',
    albumCreated: 'Album created.',
    albumUpdated: 'Album updated.',
    albumDeleted: 'Album deleted.',
    albumDeleteError: 'Could not delete.',
    albumSaveError: 'Could not save the album.',
    artistCreated: 'Artist created.',
    artistUpdated: 'Artist updated.',
    artistDeleted: 'Artist deleted.',
    artistDeleteError: 'Could not delete.',
    artistSaveError: 'Could not save the artist.',
    userUpdated: 'User updated.',
    userDeleted: 'User deleted.',
    userDeleteError: 'Could not delete.',
    userSaveError: 'Could not save the user.',
    cannotDeleteSelf: 'You cannot delete your own account.',
    loadSongsError: 'Could not load the songs.',
    loadAlbumsError: 'Could not load the albums.',
    loadArtistsError: 'Could not load the artists.',
    loadUsersError: 'Could not load the users.',
    roleReadOnly:
      'Signed up on {date}. The account type cannot be changed from here.'
  },

  /**
   * Server error messages, keyed by the `code` every API error response
   * carries. The server still sends a Spanish `error` string for its own logs,
   * but the client renders these instead, so an English UI never flashes
   * Spanish text. `errorMessage` falls back to the server string when a code
   * has no entry here.
   */
  api_error: {
    auth_token_required: 'Token required',
    auth_token_invalid: 'Invalid or expired token',
    auth_admin_required: 'Access denied. Administrator role required.',
    auth_fields_required: 'All fields are required',
    auth_password_too_short: 'The password must be at least 6 characters',
    auth_email_taken: 'That email is already registered',
    auth_register_failed: 'Registration failed',
    auth_credentials_required: 'Email and password are required',
    auth_email_unknown: 'Email not registered',
    auth_bad_password: 'Incorrect password',
    auth_login_failed: 'Sign-in failed',
    user_not_found: 'User not found',
    user_fetch_failed: 'Could not load the user',
    user_forbidden: 'Not authorised',
    user_update_failed: 'Could not update the profile',
    user_delete_failed: 'Could not delete the user',
    users_list_failed: 'Could not load the users',
    songs_list_failed: 'Could not load the songs',
    song_not_found: 'Song not found',
    song_fetch_failed: 'Could not load the song',
    song_create_failed: 'Could not create the song',
    song_update_failed: 'Could not update the song',
    song_delete_failed: 'Could not delete the song',
    albums_list_failed: 'Could not load the albums',
    album_not_found: 'Album not found',
    album_fetch_failed: 'Could not load the album',
    album_create_failed: 'Could not create the album',
    album_update_failed: 'Could not update the album',
    album_delete_failed: 'Could not delete the album',
    artists_list_failed: 'Could not load the artists',
    artist_not_found: 'Artist not found',
    artist_fetch_failed: 'Could not load the artist',
    artist_create_failed: 'Could not create the artist',
    artist_update_failed: 'Could not update the artist',
    artist_delete_failed: 'Could not delete the artist',
    playlists_list_failed: 'Could not load the playlists',
    playlist_not_found: 'Playlist not found',
    playlist_fetch_failed: 'Could not load the playlist',
    playlist_create_failed: 'Could not create the playlist',
    playlist_update_failed: 'Could not update the playlist',
    playlist_delete_failed: 'Could not delete the playlist',
    playlist_song_duplicate: 'That song is already in the playlist',
    playlist_song_add_failed: 'Could not add the song',
    playlist_song_remove_failed: 'Could not remove the song',
    search_failed: 'Search failed',
    upload_no_file: 'No file was uploaded',
    server_error: 'Something went wrong'
  },

  demo: {
    audioLater: 'Song audio will be added later — this demo has titles only.',
    dismiss: 'Dismiss'
  },

  error: {
    generic: 'Something went wrong. Please try again.'
  }
};
