// Formato dos payloads de `pest-control/v1/agenda` (ver
// App\Http\Controllers\Api\PestControl\AgendaController no backend).

export type Establishment = {
  id: number;
  name: string;
  street: string | null;
  number: string | null;
  district: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  latitude: string | null;
  longitude: string | null;
  checkin_radius_meters: number | null;
};

export type AgendaVisit = {
  id: number;
  uuid: string;
  scheduled_at: string;
  service_type: string;
  status: string;
  checkin_at: string | null;
  checkout_at: string | null;
  establishment: Establishment;
};

export type AgendaPage = {
  data: AgendaVisit[];
  current_page: number;
  last_page: number;
};

export type ControlPoint = {
  id: number;
  establishment_id: number;
  code: string | null;
  label: string;
  category_key: string;
  default_product_id: number | null;
  latitude: string | null;
  longitude: string | null;
  photo_path: string | null;
  instructions: string | null;
  display_order: number;
  required: boolean;
  active: boolean;
};

export type Product = {
  id: number;
  name: string;
  default_consumption_type: string | null;
  unit: string | null;
};

export type PestSpecies = {
  id: number;
  name: string;
  category_key: string;
};

export type LookupOption = {
  key: string;
  name: string;
};

export type CheckinPayload = {
  device_time: string;
  latitude: number | null;
  longitude: number | null;
  accuracy_meters: number | null;
  justification: string | null;
  device_id: string;
  app_version: string;
  offline_capture: boolean;
};

export type ConsumptionCode = '0' | '0.5' | '1' | 'E';

export type SpeciesFound = { species_id: number; live_count: number; dead_count: number };

/** Espelha App\Models\PestControl\VisitInspection (ver PestControlVisitService::recordInspection). */
export type ServerInspection = {
  id: number;
  uuid: string;
  control_point_id: number;
  inspected_at: string | null;
  product_id: number | null;
  consumption_type: string | null;
  consumption_code: ConsumptionCode | null;
  replaced: boolean;
  device_condition: string | null;
  live_count: number;
  dead_count: number;
  notes: string | null;
  photo_path: string | null;
  latitude: string | null;
  longitude: string | null;
  not_inspected: boolean;
  not_inspected_reason: string | null;
  species_found: SpeciesFound[];
  media: ServerMedia[];
  updated_at: string;
};

/** Espelha App\Models\PestControl\VisitSignature (só a versão vigente — ver AgendaController::show). */
export type ServerSignature = {
  id: number;
  version: number;
  responsible_name: string;
  signature_url: string;
  signed_at: string;
  superseded: boolean;
};

export type VisitDetail = {
  visit: AgendaVisit & {
    establishment: Establishment & { control_points: ControlPoint[] };
    inspections: ServerInspection[];
    media: ServerMedia[];
    signatures: ServerSignature[];
  };
  products: Product[];
  species: PestSpecies[];
  consumption_types: LookupOption[];
  point_categories: LookupOption[];
  device_conditions: string[];
};

/** Espelha App\Models\PestControl\VisitMedia::CATEGORY_* (ver app-tecnico.md, seção EVIDÊNCIAS). */
export type MediaCategory =
  'infestacao' | 'produto' | 'dispositivo' | 'dano' | 'ponto_inacessivel' | 'situacao_local' | 'servico_concluido';

export type ServerMedia = {
  id: number;
  uuid: string;
  category: MediaCategory | null;
  url: string;
  inspection_id: number | null;
};

/** Payload de POST .../points/{point}/inspection (ver VisitInspectionRequest). Fotos vão por um endpoint separado (ver lib/pest-control/media.ts). */
export type InspectionDraft = {
  product_id: number | null;
  consumption_type: string | null;
  consumption_code: ConsumptionCode | null;
  replaced: boolean;
  device_condition: string | null;
  live_count: number;
  dead_count: number;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
  not_inspected: boolean;
  not_inspected_reason: string | null;
  species: SpeciesFound[];
};

/**
 * O que vai de fato no POST da inspeção: o rascunho + o `updated_at` que o
 * aparelho conhecia ao começar a editar (ver Etapa 7 / detecção de
 * conflito). `null` só é legítimo quando o aparelho nunca viu nenhuma
 * versão desse ponto no servidor.
 */
export type InspectionSubmitPayload = InspectionDraft & { client_known_updated_at: string | null };

/** Payload de PATCH .../check-out (ver VisitCheckoutRequest). */
export type CheckoutPayload = {
  device_time: string;
  latitude: number | null;
  longitude: number | null;
  accuracy_meters: number | null;
  summary: string | null;
};

/** Payload de POST .../signature (ver VisitSignatureRequest). */
export type SignaturePayload = {
  responsible_name: string;
  responsible_role: string | null;
  responsible_document: string | null;
  signature: string;
  compliance_text: string | null;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
};

export function emptyInspectionDraft(): InspectionDraft {
  return {
    product_id: null,
    consumption_type: null,
    consumption_code: null,
    replaced: false,
    device_condition: null,
    live_count: 0,
    dead_count: 0,
    notes: null,
    latitude: null,
    longitude: null,
    not_inspected: false,
    not_inspected_reason: null,
    species: [],
  };
}
