export type Lang = "en" | "es";

export const dictionary = {
  en: {
    nav: { photos: "PHOTOS", videos: "VIDEOS", contact: "BOOKING" },
    hero: {
      role: "CONCERT PHOTOGRAPHY / VIDEOGRAPHY",
      scene: "HARD TECHNO — WAREHOUSE — INDUSTRIAL",
      scroll: "SCROLL TO ENTER",
      marquee: "HOCUS POCUS MIAMI / / AEROTECHNO MEDELLÍN / / LA SOLAR / / 140+ BPM / / RAW FOOTAGE / / NO FILTERS / /",
      statement:
        "Shot from inside the crowd. Strobes, smoke and steel — captured at the speed the floor moves.",
    },
    lens: {
      label: "OPTICS / 00",
      enter: "GOING THROUGH THE LENS",
      lock: "FOCUS LOCKED — WELCOME INSIDE",
    },
    gallery: {
      label: "ARCHIVE / 01",
      title: "PHOTOGRAPHY",
      sub: "Selected frames from the pit. Click any frame to open the viewer.",
      close: "CLOSE",
      prev: "PREV",
      next: "NEXT",
    },
    videos: {
      label: "VAULT / 02",
      title: "VIDEOS",
      sub: "DJ sets, aftermovies and festival recaps — every cut in its native frame, straight from the floor.",
      watch: "PLAY",
    },
    contact: {
      label: "TERMINAL / 03",
      title: "BOOKING SHEET",
      sub: "Direct line for promoters, collectives and venues.",
      gearTitle: "GEAR MANIFEST",
      creditsTitle: "SHOT FOR",
      festivalsTitle: "FESTIVALS",
      formTitle: "MEDIA PASS REQUEST",
      name: "NAME / COLLECTIVE",
      email: "EMAIL",
      eventField: "EVENT / VENUE",
      dateField: "DATE",
      typeField: "COVERAGE TYPE",
      typePhoto: "PHOTO",
      typeVideo: "VIDEO",
      typeBoth: "PHOTO + VIDEO",
      typeDrone: "+ DRONE",
      message: "BRIEF / DETAILS",
      send: "TRANSMIT REQUEST",
      sendHint: "Opens your email client with the request pre-filled.",
      directEmail: "DIRECT EMAIL",
      phoneLabel: "PHONE",
      instagram: "INSTAGRAM",
      basedIn: "BASED IN USA — AVAILABLE WORLDWIDE",
    },
    footer: {
      rights: "ALL FOOTAGE SHOT + CUT BY THRULENSES670",
      ctaLabel: "NEXT EVENT",
      cta: "BOOK THE LENS",
    },
  },
  es: {
    nav: { photos: "FOTOS", videos: "VIDEOS", contact: "BOOKING" },
    hero: {
      role: "FOTOGRAFÍA / VIDEOGRAFÍA DE CONCIERTOS",
      scene: "HARD TECHNO — WAREHOUSE — INDUSTRIAL",
      scroll: "SCROLL PARA ENTRAR",
      marquee: "HOCUS POCUS MIAMI / / AEROTECHNO MEDELLÍN / / LA SOLAR / / 140+ BPM / / MATERIAL CRUDO / / SIN FILTROS / /",
      statement:
        "Disparado desde adentro de la multitud. Strobes, humo y acero — capturado a la velocidad de la pista.",
    },
    lens: {
      label: "ÓPTICA / 00",
      enter: "ATRAVESANDO EL LENTE",
      lock: "ENFOQUE BLOQUEADO — BIENVENIDO ADENTRO",
    },
    gallery: {
      label: "ARCHIVO / 01",
      title: "FOTOGRAFÍA",
      sub: "Frames seleccionados desde el pit. Click en cualquier frame para abrir el visor.",
      close: "CERRAR",
      prev: "ANT",
      next: "SIG",
    },
    videos: {
      label: "BÓVEDA / 02",
      title: "VIDEOS",
      sub: "DJ sets, aftermovies y recaps de festivales — cada corte en su formato nativo, directo desde la pista.",
      watch: "PLAY",
    },
    contact: {
      label: "TERMINAL / 03",
      title: "HOJA DE BOOKING",
      sub: "Línea directa para promotores, colectivos y venues.",
      gearTitle: "MANIFIESTO DE EQUIPO",
      creditsTitle: "HE DISPARADO PARA",
      festivalsTitle: "FESTIVALES",
      formTitle: "SOLICITUD DE MEDIA PASS",
      name: "NOMBRE / COLECTIVO",
      email: "EMAIL",
      eventField: "EVENTO / VENUE",
      dateField: "FECHA",
      typeField: "TIPO DE COBERTURA",
      typePhoto: "FOTO",
      typeVideo: "VIDEO",
      typeBoth: "FOTO + VIDEO",
      typeDrone: "+ DRONE",
      message: "BRIEF / DETALLES",
      send: "TRANSMITIR SOLICITUD",
      sendHint: "Abre tu cliente de correo con la solicitud lista.",
      directEmail: "EMAIL DIRECTO",
      phoneLabel: "TELÉFONO",
      instagram: "INSTAGRAM",
      basedIn: "EN ESTADOS UNIDOS — DISPONIBLE A NIVEL MUNDIAL",
    },
    footer: {
      rights: "TODO EL MATERIAL FILMADO + EDITADO POR THRULENSES670",
      ctaLabel: "PRÓXIMO EVENTO",
      cta: "RESERVA EL LENTE",
    },
  },
} as const;

type DeepString<T> = {
  [K in keyof T]: T[K] extends object ? DeepString<T[K]> : string;
};

export type Dictionary = DeepString<(typeof dictionary)["en"]>;
