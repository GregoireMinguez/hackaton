CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE organisations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nom VARCHAR(255) NOT NULL,
  plan_abonnement VARCHAR(20) DEFAULT 'starter',
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE entites_legales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  entite_parente_id UUID REFERENCES entites_legales(id),
  nom_legal VARCHAR(255) NOT NULL,
  nom_commercial VARCHAR(255),
  forme_juridique VARCHAR(50) NOT NULL,
  pays VARCHAR(2) NOT NULL,
  numero_registre VARCHAR(100),
  date_immatriculation DATE,
  capital_social DECIMAL(14,2),
  devise VARCHAR(3) DEFAULT 'EUR',
  siege_social JSONB,
  statut VARCHAR(20) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE representants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entite_id UUID REFERENCES entites_legales(id) ON DELETE CASCADE,
  nom_complet VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  role VARCHAR(100) NOT NULL,
  date_debut DATE NOT NULL,
  date_fin DATE,
  document_identite_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entite_id UUID REFERENCES entites_legales(id) ON DELETE CASCADE,
  nom VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  langue VARCHAR(5) DEFAULT 'fr',
  fichier_url TEXT,
  date_emission DATE,
  date_expiration DATE,
  est_certificat_eu BOOLEAN DEFAULT FALSE,
  signature_electronique_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE obligations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entite_id UUID REFERENCES entites_legales(id) ON DELETE CASCADE,
  titre VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  echeance DATE NOT NULL,
  statut VARCHAR(20) DEFAULT 'a_faire',
  priorite VARCHAR(10) DEFAULT 'normale',
  description TEXT,
  document_id UUID REFERENCES documents(id),
  accomplie_le DATE,
  accomplie_par UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE creations_filiales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  entite_parente_id UUID REFERENCES entites_legales(id),
  pays_cible VARCHAR(2) NOT NULL,
  forme_juridique_cible VARCHAR(50),
  nom_filiale VARCHAR(255),
  statut VARCHAR(20) DEFAULT 'brouillon',
  etape_courante INTEGER DEFAULT 1,
  donnees_formulaire JSONB DEFAULT '{}',
  entite_creee_id UUID REFERENCES entites_legales(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE associes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entite_id UUID REFERENCES entites_legales(id) ON DELETE CASCADE,
  nom VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  type VARCHAR(30) NOT NULL,
  nb_actions DECIMAL(14,0) NOT NULL DEFAULT 0,
  type_actions VARCHAR(50) DEFAULT 'ordinaires',
  prix_acquisition DECIMAL(10,4),
  date_entree DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE stock_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entite_id UUID REFERENCES entites_legales(id) ON DELETE CASCADE,
  beneficiaire_nom VARCHAR(255) NOT NULL,
  beneficiaire_email VARCHAR(255),
  nb_options INTEGER NOT NULL,
  prix_exercice DECIMAL(10,4),
  devise VARCHAR(3) DEFAULT 'EUR',
  date_attribution DATE NOT NULL,
  date_cliff DATE,
  date_fin_vesting DATE,
  mois_vesting INTEGER DEFAULT 48,
  statut VARCHAR(20) DEFAULT 'attribuees',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE membres_equipe (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'member',
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ
);

CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id UUID REFERENCES organisations(id),
  entite_id UUID REFERENCES entites_legales(id),
  user_id UUID REFERENCES auth.users(id),
  user_nom VARCHAR(255),
  action VARCHAR(255) NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE entites_legales ENABLE ROW LEVEL SECURITY;
ALTER TABLE representants ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE creations_filiales ENABLE ROW LEVEL SECURITY;
ALTER TABLE associes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE membres_equipe ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_own" ON organisations
  FOR ALL USING (owner_user_id = auth.uid());

CREATE POLICY "entites_org" ON entites_legales
  FOR ALL USING (organisation_id IN (
    SELECT o.id FROM organisations o
    LEFT JOIN membres_equipe m ON m.organisation_id = o.id
    WHERE o.owner_user_id = auth.uid() OR m.user_id = auth.uid()
  ));

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER tr_orgs_upd BEFORE UPDATE ON organisations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_entites_upd BEFORE UPDATE ON entites_legales FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_filiales_upd BEFORE UPDATE ON creations_filiales FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Reference data: legal forms
CREATE TABLE formes_juridiques_ref (
  pays VARCHAR(2) NOT NULL,
  code VARCHAR(10) NOT NULL,
  nom_local VARCHAR(100),
  nom_fr VARCHAR(100),
  capital_min INTEGER DEFAULT 0,
  PRIMARY KEY (pays, code)
);

INSERT INTO formes_juridiques_ref VALUES
('FR','SAS','SAS','Société par Actions Simplifiée',1),
('FR','SARL','SARL','Société à Responsabilité Limitée',1),
('FR','SA','SA','Société Anonyme',37000),
('DE','GmbH','GmbH','Gesellschaft mit beschränkter Haftung',25000),
('DE','UG','UG','Unternehmergesellschaft',1),
('DE','AG','AG','Aktiengesellschaft',50000),
('NL','BV','BV','Besloten Vennootschap',1),
('NL','NV','NV','Naamloze Vennootschap',45000),
('ES','SL','S.L.','Sociedad Limitada',3000),
('IT','SRL','S.r.l.','Società a Responsabilità Limitata',1),
('BE','SRL','SRL','Société à Responsabilité Limitée',1),
('LU','SARL','SARL','Société à Responsabilité Limitée',12500),
('IE','Ltd','Ltd','Private Company Limited by Shares',1),
('PT','LDA','Lda.','Sociedade por Quotas',1),
('PL','SP.Z.O.O','Sp. z o.o.','Spółka z Ograniczoną Odpowiedzialnością',5000),
('SE','AB','AB','Aktiebolag',25000),
('DK','ApS','ApS','Anpartsselskab',40000),
('AT','GmbH','GmbH','Gesellschaft mit beschränkter Haftung',35000),
('FI','OY','Oy','Osakeyhtiö',2500),
('CZ','S.R.O','s.r.o.','Společnost s Ručením Omezeným',1);

-- Reference data: compliance obligations by country
CREATE TABLE obligations_ref (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pays VARCHAR(2),
  forme_juridique VARCHAR(10),
  type VARCHAR(50),
  titre VARCHAR(255),
  description TEXT,
  mois_depuis_cloture INTEGER,
  recurrence VARCHAR(20)
);

INSERT INTO obligations_ref (pays, type, titre, mois_depuis_cloture, recurrence) VALUES
('FR','ag_annuelle','Assemblée Générale Annuelle',6,'annuelle'),
('FR','depot_comptes','Dépôt des comptes au greffe (INPI/RNE)',6,'annuelle'),
('DE','ag_annuelle','Gesellschafterversammlung',8,'annuelle'),
('DE','depot_comptes','Jahresabschluss — Handelsregister',12,'annuelle'),
('NL','ag_annuelle','Algemene Vergadering van Aandeelhouders',6,'annuelle'),
('NL','depot_comptes','Jaarrekening deponeren (KvK)',6,'annuelle'),
('ES','ag_annuelle','Junta General Ordinaria',6,'annuelle'),
(NULL,'mise_a_jour_registre','Mise à jour registre (Directive EU 2025/25 — 15 jours)',0,'ponctuelle');
