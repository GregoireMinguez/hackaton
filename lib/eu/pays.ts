export interface FormeJuridique {
  code: string
  nom: string
  capital_min: number
}

export interface ConfigPays {
  code: string
  nom_fr: string
  emoji: string
  langue_officielle: string
  url_registre: string
  capital_min_sarl: number
  delai_mise_a_jour: number // always 15 per cadre européen
  formes_juridiques: FormeJuridique[]
  // Approximate SVG position (viewBox 500x400) for the EU map
  map_x: number
  map_y: number
}

export const PAYS_EU: ConfigPays[] = [
  {
    code: 'FR', nom_fr: 'France', emoji: '🇫🇷',
    langue_officielle: 'fr', url_registre: 'https://www.inpi.fr',
    capital_min_sarl: 1, delai_mise_a_jour: 15, map_x: 155, map_y: 230,
    formes_juridiques: [
      { code: 'SAS', nom: 'SAS – Société par Actions Simplifiée', capital_min: 1 },
      { code: 'SARL', nom: 'SARL – Société à Responsabilité Limitée', capital_min: 1 },
      { code: 'SA', nom: 'SA – Société Anonyme', capital_min: 37000 },
    ],
  },
  {
    code: 'DE', nom_fr: 'Allemagne', emoji: '🇩🇪',
    langue_officielle: 'de', url_registre: 'https://www.handelsregister.de',
    capital_min_sarl: 25000, delai_mise_a_jour: 15, map_x: 240, map_y: 170, // DE
    formes_juridiques: [
      { code: 'GmbH', nom: 'GmbH – Gesellschaft mit beschränkter Haftung', capital_min: 25000 },
      { code: 'UG', nom: 'UG – Unternehmergesellschaft', capital_min: 1 },
      { code: 'AG', nom: 'AG – Aktiengesellschaft', capital_min: 50000 },
    ],
  },
  {
    code: 'NL', nom_fr: 'Pays-Bas', emoji: '🇳🇱',
    langue_officielle: 'nl', url_registre: 'https://www.kvk.nl',
    capital_min_sarl: 1, delai_mise_a_jour: 15, map_x: 205, map_y: 155,
    formes_juridiques: [
      { code: 'BV', nom: 'BV – Besloten Vennootschap', capital_min: 1 },
      { code: 'NV', nom: 'NV – Naamloze Vennootschap', capital_min: 45000 },
    ],
  },
  {
    code: 'ES', nom_fr: 'Espagne', emoji: '🇪🇸',
    langue_officielle: 'es', url_registre: 'https://www.registradores.org',
    capital_min_sarl: 3000, delai_mise_a_jour: 15, map_x: 120, map_y: 285,
    formes_juridiques: [
      { code: 'SL', nom: 'S.L. – Sociedad Limitada', capital_min: 3000 },
      { code: 'SA', nom: 'S.A. – Sociedad Anónima', capital_min: 60000 },
    ],
  },
  {
    code: 'IT', nom_fr: 'Italie', emoji: '🇮🇹',
    langue_officielle: 'it', url_registre: 'https://www.registroimprese.it',
    capital_min_sarl: 1, delai_mise_a_jour: 15, map_x: 255, map_y: 265,
    formes_juridiques: [
      { code: 'SRL', nom: 'S.r.l. – Società a Responsabilità Limitata', capital_min: 1 },
      { code: 'SPA', nom: 'S.p.A. – Società per Azioni', capital_min: 50000 },
    ],
  },
  {
    code: 'BE', nom_fr: 'Belgique', emoji: '🇧🇪',
    langue_officielle: 'fr', url_registre: 'https://www.cbce.be',
    capital_min_sarl: 1, delai_mise_a_jour: 15, map_x: 200, map_y: 183,
    formes_juridiques: [
      { code: 'SRL', nom: 'SRL – Société à Responsabilité Limitée', capital_min: 1 },
      { code: 'SA', nom: 'SA – Société Anonyme', capital_min: 61500 },
    ],
  },
  {
    code: 'LU', nom_fr: 'Luxembourg', emoji: '🇱🇺',
    langue_officielle: 'fr', url_registre: 'https://www.lbr.lu',
    capital_min_sarl: 12500, delai_mise_a_jour: 15, map_x: 218, map_y: 200,
    formes_juridiques: [
      { code: 'SARL', nom: 'SARL – Société à Responsabilité Limitée', capital_min: 12500 },
      { code: 'SA', nom: 'SA – Société Anonyme', capital_min: 30000 },
    ],
  },
  {
    code: 'IE', nom_fr: 'Irlande', emoji: '🇮🇪',
    langue_officielle: 'en', url_registre: 'https://www.cro.ie',
    capital_min_sarl: 1, delai_mise_a_jour: 15, map_x: 90, map_y: 158,
    formes_juridiques: [
      { code: 'Ltd', nom: 'Private Company Limited by Shares', capital_min: 1 },
      { code: 'PLC', nom: 'Public Limited Company', capital_min: 25000 },
    ],
  },
  {
    code: 'PT', nom_fr: 'Portugal', emoji: '🇵🇹',
    langue_officielle: 'pt', url_registre: 'https://www.rnpc.mj.pt',
    capital_min_sarl: 1, delai_mise_a_jour: 15, map_x: 70, map_y: 285,
    formes_juridiques: [
      { code: 'LDA', nom: 'Lda. – Sociedade por Quotas', capital_min: 1 },
      { code: 'SA', nom: 'SA – Sociedade Anónima', capital_min: 50000 },
    ],
  },
  {
    code: 'PL', nom_fr: 'Pologne', emoji: '🇵🇱',
    langue_officielle: 'pl', url_registre: 'https://www.krs.ms.gov.pl',
    capital_min_sarl: 5000, delai_mise_a_jour: 15, map_x: 310, map_y: 160,
    formes_juridiques: [
      { code: 'SP.Z.O.O', nom: 'Sp. z o.o. – Spółka z Ograniczoną Odpowiedzialnością', capital_min: 5000 },
    ],
  },
  {
    code: 'SE', nom_fr: 'Suède', emoji: '🇸🇪',
    langue_officielle: 'sv', url_registre: 'https://www.bolagsverket.se',
    capital_min_sarl: 25000, delai_mise_a_jour: 15, map_x: 285, map_y: 110,
    formes_juridiques: [
      { code: 'AB', nom: 'AB – Aktiebolag', capital_min: 25000 },
    ],
  },
  {
    code: 'DK', nom_fr: 'Danemark', emoji: '🇩🇰',
    langue_officielle: 'da', url_registre: 'https://www.cvr.dk',
    capital_min_sarl: 40000, delai_mise_a_jour: 15, map_x: 230, map_y: 128,
    formes_juridiques: [
      { code: 'ApS', nom: 'ApS – Anpartsselskab', capital_min: 40000 },
      { code: 'A/S', nom: 'A/S – Aktieselskab', capital_min: 400000 },
    ],
  },
  {
    code: 'AT', nom_fr: 'Autriche', emoji: '🇦🇹',
    langue_officielle: 'de', url_registre: 'https://www.firmenbuch.at',
    capital_min_sarl: 35000, delai_mise_a_jour: 15, map_x: 263, map_y: 213,
    formes_juridiques: [
      { code: 'GmbH', nom: 'GmbH – Gesellschaft mit beschränkter Haftung', capital_min: 35000 },
      { code: 'AG', nom: 'AG – Aktiengesellschaft', capital_min: 70000 },
    ],
  },
  {
    code: 'FI', nom_fr: 'Finlande', emoji: '🇫🇮',
    langue_officielle: 'fi', url_registre: 'https://www.prh.fi',
    capital_min_sarl: 2500, delai_mise_a_jour: 15, map_x: 340, map_y: 95,
    formes_juridiques: [
      { code: 'OY', nom: 'Oy – Osakeyhtiö', capital_min: 2500 },
    ],
  },
  {
    code: 'CZ', nom_fr: 'Tchéquie', emoji: '🇨🇿',
    langue_officielle: 'cs', url_registre: 'https://or.justice.cz',
    capital_min_sarl: 1, delai_mise_a_jour: 15, map_x: 272, map_y: 183,
    formes_juridiques: [
      { code: 'S.R.O', nom: 's.r.o. – Společnost s Ručením Omezeným', capital_min: 1 },
    ],
  },
  {
    code: 'RO', nom_fr: 'Roumanie', emoji: '🇷🇴',
    langue_officielle: 'ro', url_registre: 'https://www.onrc.ro',
    capital_min_sarl: 1, delai_mise_a_jour: 15, map_x: 338, map_y: 218,
    formes_juridiques: [
      { code: 'SRL', nom: 'SRL – Societate cu Răspundere Limitată', capital_min: 1 },
    ],
  },
]

export function getPaysParCode(code: string): ConfigPays | undefined {
  return PAYS_EU.find(p => p.code === code)
}

export function getFormeJuridique(pays: string, code: string): FormeJuridique | undefined {
  return getPaysParCode(pays)?.formes_juridiques.find(f => f.code === code)
}
