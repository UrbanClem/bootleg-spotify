/**
 * Spanish strings. Must define exactly the same keys as `en.js`.
 *
 * Dates and numbers are localised by `Intl`, so the plural rules here are the
 * simple 1 / everything-else split that both languages happen to share.
 */
export default {
  common: {
    cancel: 'Cancelar',
    save: 'Guardar',
    saving: 'Guardando…',
    create: 'Crear',
    creating: 'Creando…',
    add: 'Añadir',
    edit: 'Editar',
    delete: 'Eliminar',
    close: 'Cerrar',
    gotIt: 'Entendido',
    loading: 'Cargando',
    unknown: '—',
    you: 'Tú',
    yes: 'Sí',
    no: 'No'
  },

  nav: {
    home: 'Inicio',
    search: 'Buscar',
    library: 'Tu biblioteca',
    createPlaylist: 'Crear playlist',
    mainNavigation: 'Navegación principal',
    seeWholeLibrary: 'Ver tu biblioteca completa',
    openMenu: 'Abrir menú',
    back: 'Atrás',
    forward: 'Adelante',
    accountMenu: 'Menú de la cuenta',
    account: 'Cuenta',
    adminPanel: 'Panel de administración',
    signOut: 'Cerrar sesión',
    guest: 'Invitado',
    language: 'Idioma'
  },

  role: {
    admin: 'Administrador',
    user: 'Usuario'
  },

  plural: {
    song: { one: '{n} canción', other: '{n} canciones' },
    album: { one: '{n} álbum', other: '{n} álbumes' },
    artist: { one: '{n} artista', other: '{n} artistas' },
    playlist: { one: '{n} playlist', other: '{n} playlists' },
    follower: { one: '{n} seguidor', other: '{n} seguidores' },
    minute: { one: '{n} min', other: '{n} min' }
  },

  kind: {
    album: 'Álbum',
    artist: 'Artista',
    playlist: 'Playlist'
  },

  label: {
    song: 'Canción',
    album: 'Álbum',
    artist: 'Artista',
    songs: 'Canciones',
    albums: 'Álbumes',
    artists: 'Artistas'
  },

  player: {
    idle: 'Nada reproduciéndose',
    idleHint: 'Elige una canción para empezar',
    play: 'Reproducir',
    pause: 'Pausar',
    previous: 'Canción anterior',
    next: 'Canción siguiente',
    shuffle: 'Aleatorio',
    repeat: 'Repetir',
    repeatOff: 'Repetir: desactivado',
    repeatAll: 'Repetir: toda la cola',
    repeatOne: 'Repetir: canción actual',
    volume: 'Volumen',
    mute: 'Silenciar',
    unmute: 'Activar sonido',
    queue: 'Cola de reproducción',
    closeQueue: 'Cerrar cola',
    queuePanel: 'Cola de reproducción',
    nowPlaying: 'Reproduciendo ahora',
    upNext: 'A continuación',
    queueEmptyIdle: 'No se está reproduciendo nada.',
    queueEmptyHint: 'La cola está vacía. Añade canciones desde cualquier lista.',
    noAudio: 'Sin archivo de audio',
    progress: 'Progreso de la reproducción',
    playNext: 'Reproducir a continuación'
  },

  track: {
    play: 'Reproducir {title}',
    addToQueue: 'Añadir {title} a la cola',
    addToQueueShort: 'Añadir a la cola',
    moreOptions: 'Más opciones para {title}',
    explicit: 'Contiene letra explícita',
    unknownArtist: 'Artista desconocido',
    title: 'Título'
  },

  shelf: {
    seeAll: 'Mostrar todo'
  },

  card: {
    verified: 'Verificado',
    verifiedArtist: 'Artista verificado',
    pause: 'Pausar {title}',
    play: 'Reproducir {title}'
  },

  home: {
    loadError: 'No se pudo cargar tu inicio.',
    subtitle: 'Todo lo que te gusta, en un solo lugar.',
    searchMusic: 'Buscar música',
    madeForYou: 'Hecho para ti',
    madeForYouSub: 'Una selección del catálogo',
    yourPlaylists: 'Tus playlists',
    newAlbums: 'Nuevos álbumes',
    artistsYouLike: 'Artistas que te podrían gustar',
    popularNow: 'Populares ahora',
    emptyTitle: 'Tu biblioteca está vacía',
    emptyText: 'Crea tu primera playlist o explora los álbumes disponibles.',
    browseCatalogue: 'Explorar el catálogo'
  },

  greeting: {
    morning: 'Buenos días',
    afternoon: 'Buenas tardes',
    evening: 'Buenas noches',
    night: 'Buenas noches'
  },

  search: {
    placeholder: '¿Qué quieres escuchar?',
    label: 'Buscar',
    clear: 'Borrar búsqueda',
    failed: 'La búsqueda falló.',
    browseByGenre: 'Explorar por género',
    noResults: 'Sin resultados para «{query}»',
    noResultsText: 'Prueba con otro artista, álbum o género.',
    songs: 'Canciones',
    albums: 'Álbumes',
    artists: 'Artistas',
    seeAllSongs: 'Ver todas las canciones',
    seeAllAlbums: 'Ver todos los álbumes',
    seeAllArtists: 'Ver todos los artistas'
  },

  tab: {
    all: 'Todo'
  },

  library: {
    title: 'Tu biblioteca',
    filterPlaceholder: 'Filtrar por nombre',
    filterLabel: 'Filtrar playlists',
    sortBy: 'Ordenar por',
    sortRecent: 'Añadidas recientemente',
    sortName: 'Nombre',
    sortSongs: 'Número de canciones',
    count: { one: '{n} playlist', other: '{n} playlists' },
    loadError: 'No se pudo cargar tu biblioteca.',
    emptyTitle: 'Todavía no tienes playlists',
    emptyText: 'Usa «Crear playlist» en la barra lateral para empezar una.',
    browseMusic: 'Explorar música',
    noResults: 'Sin resultados',
    noResultsText: 'Ninguna playlist coincide con «{query}».',
    emptyPlaylist: 'Vacía',
    sidebarEmpty: 'Todavía no tienes playlists.',
    sidebarSignedOut: 'Inicia sesión para ver tu biblioteca.'
  },

  album: {
    notFound: 'Álbum no encontrado',
    loadError: 'No se pudo cargar el álbum.',
    searchMusic: 'Buscar música',
    noAudioYet: 'Aún no hay audio subido',
    emptyTitle: 'Este álbum todavía no tiene canciones',
    emptyText: 'Añade canciones desde el panel de administración.'
  },

  artist: {
    notFound: 'Artista no encontrado',
    loadError: 'No se pudo cargar el artista.',
    searchArtists: 'Buscar artistas',
    followers: '{n} seguidores',
    onPlatformSince: 'En la plataforma desde {date}',
    emptyTitle: 'Este artista todavía no tiene canciones',
    emptyText: 'Añade canciones desde el panel de administración.',
    popular: 'Popular',
    playPopular: 'Reproducir lo popular',
    addAllToQueue: 'Añadir todo a la cola',
    seeLess: 'Ver menos',
    seeAllSongs: 'Ver las {n} canciones',
    appearsOn: 'Aparece en',
    appearsOnSubtitle: '{year} · {count}',
    generic: 'Artista'
  },

  playlist: {
    notFound: 'Playlist no encontrada',
    loadError: 'No se pudo cargar la playlist.',
    goToLibrary: 'Ir a tu biblioteca',
    yourAccount: 'Tu cuenta',
    createdOn: 'Creada el {date}',
    emptyTitle: 'Esta playlist está vacía',
    emptyText: 'Usa el botón «Añadir canciones» para empezar a llenarla.',
    editDetails: 'Editar detalles',
    addSongs: 'Añadir canciones',
    deletePlaylist: 'Eliminar playlist',
    options: 'Opciones de la playlist',
    ownerOnly: 'Solo el propietario puede editarla.',
    play: 'Reproducir',
    addToQueue: 'Añadir a la cola',
    removeFromPlaylist: 'Quitar de la playlist',
    editModalTitle: 'Editar detalles de la playlist',
    nameEmpty: 'El nombre no puede estar vacío.',
    saveFailed: 'No se pudo guardar.',
    addSongsModal: 'Añadir canciones',
    filterPlaceholder: 'Filtrar por título o artista',
    filterLabel: 'Filtrar canciones',
    noSongsToAdd: 'No hay canciones para añadir.',
    addSongFailed: 'No se pudo añadir la canción.',
    removeSongError: 'No se pudo quitar la canción.',
    removeError: 'No se pudo eliminar la playlist.',
    removeConfirm: '¿Eliminar «{name}»? Esta acción no se puede deshacer.'
  },

  profile: {
    admin: 'Administrador',
    user: 'Usuario',
    memberSince: 'Miembro desde {date}',
    sinceLabel: 'Miembro desde',
    accountInfo: 'Datos de la cuenta',
    name: 'Nombre',
    email: 'Correo electrónico',
    birthDate: 'Fecha de nacimiento',
    country: 'País',
    countryPlaceholder: 'España',
    saveChanges: 'Guardar cambios',
    saved: 'Perfil actualizado.',
    saveError: 'No se pudo guardar el perfil.',
    accountType: 'Tipo de cuenta',
    playlists: 'Playlists',
    savedSongs: 'Canciones guardadas'
  },

  auth: {
    signIn: 'Iniciar sesión',
    signInTagline: 'Sigue escuchando donde lo dejaste.',
    email: 'Correo',
    emailPlaceholder: 'tu@correo.com',
    password: 'Contraseña',
    showPassword: 'Mostrar contraseña',
    hidePassword: 'Ocultar contraseña',
    signingIn: 'Iniciando sesión…',
    failed: 'No pudimos iniciar sesión. Revisa tus datos.',
    noAccount: '¿Aún no tienes cuenta?',
    registerCta: 'Regístrate en Bootleg',
    demoAccount: 'Cuenta de demostración',
    createAccount: 'Crea tu cuenta',
    createTagline: 'Empieza a escuchar en segundos.',
    yourName: 'Tu nombre',
    namePlaceholder: 'Tu nombre',
    passwordPlaceholder: 'Mínimo 6 caracteres',
    strengthWeak: 'Débil',
    strengthNormal: 'Normal',
    strengthGood: 'Buena',
    strengthStrong: 'Fuerte',
    tooShort: 'La contraseña debe tener al menos 6 caracteres.',
    creating: 'Creando la cuenta…',
    register: 'Crear cuenta',
    haveAccount: '¿Ya tienes una cuenta?',
    signInCta: 'Iniciar sesión',
    createFailed: 'No pudimos crear la cuenta. Inténtalo de nuevo.'
  },

  createPlaylist: {
    title: 'Crear playlist',
    nameRequired: 'Ponle un nombre a la playlist.',
    nameLabel: 'Nombre',
    namePlaceholder: 'Mi playlist',
    descriptionLabel: 'Descripción',
    descriptionPlaceholder: '¿De qué trata esta playlist?',
    private: 'Privada',
    failed: 'No se pudo crear la playlist.'
  },

  field: {
    name: 'Nombre',
    stageName: 'Nombre artístico',
    title: 'Título',
    description: 'Descripción',
    artist: 'Artista',
    album: 'Álbum',
    genre: 'Género',
    genrePlaceholder: 'Indie rock',
    duration: 'Duración (segundos)',
    releaseDate: 'Fecha de lanzamiento',
    signUpDate: 'Fecha de alta',
    lyrics: 'Letra',
    explicitContent: 'Contenido explícito',
    verifiedArtist: 'Artista verificado',
    audioFile: 'Archivo de audio',
    currentFile: 'Actual: {file}',
    audioHint: 'MP3, WAV, OGG o M4A. Máximo 50 MB.',
    cover: 'Portada',
    currentCover: 'Portada actual',
    imageHint: 'JPG, PNG, GIF o WEBP. Máximo 10 MB.',
    photo: 'Foto de perfil',
    currentPhoto: 'Foto actual',
    select: 'Seleccionar…',
    noAlbum: 'Sin álbum',
    selectArtist: 'Selecciona un artista.',
    titleRequired: 'El título es obligatorio.',
    nameRequired: 'El nombre es obligatorio.'
  },

  modal: {
    close: 'Cerrar'
  },

  feedback: {
    closeAlert: 'Descartar mensaje',
    loading: 'Cargando'
  },

  share: {
    copy: 'Compartir',
    copied: 'Enlace copiado',
    copyTitle: 'Copiar enlace'
  },

  admin: {
    title: 'Administración',
    sections: 'Secciones de administración',
    overview: 'Resumen',
    songs: 'Canciones',
    albums: 'Álbumes',
    artists: 'Artistas',
    users: 'Usuarios',
    manage: 'Gestionar →',
    loadError: 'No se pudo cargar el panel.',
    withAudioTitle: 'Canciones con audio',
    withAudioOf: 'de {n}',
    withAudioHint:
      'Las canciones sin archivo todavía no se pueden reproducir. Sube el audio desde la sección Canciones.',
    manageSongs: 'Gestionar canciones',
    recentUsers: 'Usuarios recientes',
    noData: 'Sin datos.',
    filterSongs: 'Filtrar canciones',
    filterAlbums: 'Filtrar álbumes',
    filterArtists: 'Filtrar artistas',
    filterUsers: 'Filtrar usuarios',
    withAudioCount: '{n} con audio subido',
    withCoverCount: '{n} con portada',
    verifiedCount: '{n} verificados',
    newSong: 'Nueva canción',
    newAlbum: 'Nuevo álbum',
    newArtist: 'Nuevo artista',
    editSong: 'Editar «{name}»',
    editAlbum: 'Editar «{name}»',
    editArtist: 'Editar «{name}»',
    editUser: 'Editar «{name}»',
    noSongs: 'Sin canciones',
    noSongsHint: 'Crea la primera para empezar el catálogo.',
    noAlbums: 'Sin álbumes',
    noArtists: 'Sin artistas',
    noUsers: 'Sin usuarios',
    audioReady: 'Listo',
    audioMissing: 'Sin audio',
    columnName: 'Nombre',
    columnEmail: 'Correo',
    columnAccount: 'Cuenta',
    columnCountry: 'País',
    columnSignedUp: 'Alta',
    columnArtist: 'Artista',
    columnAlbum: 'Álbum',
    columnGenre: 'Género',
    columnDate: 'Fecha',
    columnSongs: 'Canciones',
    columnCover: 'Portada',
    columnAudio: 'Audio',
    columnDuration: 'Duración',
    columnFollowers: 'Seguidores',
    columnVerified: 'Verificado',
    columnPhoto: 'Foto',
    editAction: 'Editar {name}',
    deleteAction: 'Eliminar {name}',
    confirmDeleteSong: '¿Eliminar «{name}»? Esta acción no se puede deshacer.',
    confirmDeleteAlbum: '¿Eliminar el álbum «{name}»?',
    confirmDeleteArtist: '¿Eliminar al artista «{name}»?',
    confirmDeleteUser: '¿Eliminar «{name}»?',
    songCreated: 'Canción creada.',
    songDeleted: 'Canción eliminada.',
    songUpdated: 'Canción actualizada.',
    songDeleteError: 'No se pudo eliminar.',
    songSaveError: 'No se pudo guardar la canción.',
    albumCreated: 'Álbum creado.',
    albumDeleted: 'Álbum eliminado.',
    albumUpdated: 'Álbum actualizado.',
    albumDeleteError: 'No se pudo eliminar.',
    albumSaveError: 'No se pudo guardar el álbum.',
    artistCreated: 'Artista creado.',
    artistDeleted: 'Artista eliminado.',
    artistUpdated: 'Artista actualizado.',
    artistDeleteError: 'No se pudo eliminar.',
    artistSaveError: 'No se pudo guardar el artista.',
    userUpdated: 'Usuario actualizado.',
    userDeleted: 'Usuario eliminado.',
    userDeleteError: 'No se pudo eliminar.',
    userSaveError: 'No se pudo guardar el usuario.',
    cannotDeleteSelf: 'No puedes eliminar tu propia cuenta.',
    loadSongsError: 'No se pudieron cargar las canciones.',
    loadAlbumsError: 'No se pudieron cargar los álbumes.',
    loadArtistsError: 'No se pudieron cargar los artistas.',
    loadUsersError: 'No se pudieron cargar los usuarios.',
    roleReadOnly:
      'Se registró el {date}. El tipo de cuenta no se puede cambiar desde aquí.'
  },

  /** Ver `api_error` en `en.js`. */
  api_error: {
    auth_token_required: 'Token requerido',
    auth_token_invalid: 'Token inválido o expirado',
    auth_admin_required: 'Acceso denegado. Se requiere rol de administrador.',
    auth_fields_required: 'Todos los campos son requeridos',
    auth_password_too_short: 'La contraseña debe tener al menos 6 caracteres',
    auth_email_taken: 'Este email ya está registrado',
    auth_register_failed: 'Error en el registro',
    auth_credentials_required: 'Email y contraseña son requeridos',
    auth_email_unknown: 'Email no registrado',
    auth_bad_password: 'Contraseña incorrecta',
    auth_login_failed: 'Error en el inicio de sesión',
    user_not_found: 'Usuario no encontrado',
    user_fetch_failed: 'Error al obtener el usuario',
    user_forbidden: 'No autorizado',
    user_update_failed: 'Error al actualizar el perfil',
    user_delete_failed: 'Error al eliminar el usuario',
    users_list_failed: 'Error al obtener los usuarios',
    songs_list_failed: 'Error al obtener las canciones',
    song_not_found: 'Canción no encontrada',
    song_fetch_failed: 'Error al obtener la canción',
    song_create_failed: 'Error al crear la canción',
    song_update_failed: 'Error al actualizar la canción',
    song_delete_failed: 'Error al eliminar la canción',
    albums_list_failed: 'Error al obtener los álbumes',
    album_not_found: 'Álbum no encontrado',
    album_fetch_failed: 'Error al obtener el álbum',
    album_create_failed: 'Error al crear el álbum',
    album_update_failed: 'Error al actualizar el álbum',
    album_delete_failed: 'Error al eliminar el álbum',
    artists_list_failed: 'Error al obtener los artistas',
    artist_not_found: 'Artista no encontrado',
    artist_fetch_failed: 'Error al obtener el artista',
    artist_create_failed: 'Error al crear el artista',
    artist_update_failed: 'Error al actualizar el artista',
    artist_delete_failed: 'Error al eliminar el artista',
    playlists_list_failed: 'Error al obtener las playlists',
    playlist_not_found: 'Playlist no encontrada',
    playlist_fetch_failed: 'Error al obtener la playlist',
    playlist_create_failed: 'Error al crear la playlist',
    playlist_update_failed: 'Error al actualizar la playlist',
    playlist_delete_failed: 'Error al eliminar la playlist',
    playlist_song_duplicate: 'La canción ya está en la playlist',
    playlist_song_add_failed: 'Error al agregar la canción',
    playlist_song_remove_failed: 'Error al remover la canción',
    search_failed: 'Error en la búsqueda',
    upload_no_file: 'No se subió ningún archivo',
    server_error: 'Algo salió mal'
  },

  demo: {
    syntheticNotice:
      'Versión de demostración: todos los artistas, álbumes y canciones son ficticios, y cada pista es un tono sintetizado corto en lugar de una grabación real.',
    dismiss: 'Cerrar'
  },

  error: {
    generic: 'Algo salió mal. Inténtalo de nuevo.'
  }
};
