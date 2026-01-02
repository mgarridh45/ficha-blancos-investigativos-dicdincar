export enum Department {
  OS7 = 'Departamento Antidrogas OS7',
  SEBV = 'Departamento Encargo y Búsqueda de Personas y Vehículos SEBV',
  OS9 = 'Departamento de Investigación de Organizaciones Criminales OS9',
  CAODI_SUR = 'CAODI Zona Centro Sur',
  CAODI_NORTE = 'CAODI Zona Norte',
  LABOCAR = 'Labocar',
  OTHER = 'Otro / Unidad Territorial'
}

export const CHILE_REGIONS = [
  "Arica y Parinacota",
  "Tarapacá",
  "Antofagasta",
  "Atacama",
  "Coquimbo",
  "Valparaíso",
  "Metropolitana",
  "O'Higgins",
  "Maule",
  "Ñuble",
  "Biobío",
  "Araucanía",
  "Los Ríos",
  "Los Lagos",
  "Aysén",
  "Magallanes"
];

export enum RiskLevel {
  LOW = 'Bajo',
  MEDIUM = 'Medio',
  HIGH = 'Alto',
  EXTREME = 'Extremo - Peligroso'
}

// --- Specific Record Interfaces based on PDF ---

export interface PoliceRecord {
  type: string; // DETENIDO
  crime: string;
  unit: string;
  date: string;
  reportNumber: string; // PARTE
}

export interface Associate {
  rut: string;
  name: string;
  crime: string;
  date: string;
  reportNumber: string;
  unit: string; // Added
  year: string; // Added
}

export interface CriminalRecord {
  crime: string;
  tribunal: string;
  year: string;
}

export interface PublicMinistryCause {
  ruc: string;
  prosecution: string; // FISCALIA
  status: 'TERMINADO' | 'VIGENTE' | 'EN TRAMITE';
  lastStatus?: string;
  crime: string;
}

export interface Complaint {
  institution: 'CARABINEROS' | 'PDI' | 'FISCALIA';
  type: string;
  crime: string;
  date: string;
  observations: string;
}

export interface GendarmerieRecord {
  penalUnit: string;
  entryDate: string;
  exitDate: string;
  exitCause: string;
}

export interface InternationalMovement {
  date: string;
  direction: 'ENTRADA' | 'SALIDA';
  via: string; // TERRESTRE/AEREA
  medium: string; // Flight number or vehicle plate
  country: string;
  docType: string;
}

export interface OtherBackground {
  date: string;
  situation: string;
  place: string;
  circumstances: string;
  seizedItems: string;
}

export interface NewsLink {
  source: string;
  url: string;
}

export interface Child {
  rut: string;
  fullName: string;
  birthDate?: string;
}

// --- New Asset Interfaces ---

export interface Vehicle {
  brand: string;
  model: string;
  year: string;
  color: string;
  plate: string;
  motor: string;
  chassis: string;
}

export interface SubjectAddress {
  street: string;
  number: string;
  intersection: string;
  apartment?: string;
  commune?: string;
  observationType?: string; // Condominio, Loteo, etc.
}

export interface SocialMedia {
  platform: string; 
  username: string; 
  url?: string;
}

export interface Phone {
  number: string;
  company?: string; 
  note?: string;
}

export interface AccessLogEntry {
  timestamp: string;
  user: string; // Officer Rank + Name
  department: string;
  action: 'VISUALIZACION' | 'IMPRESION' | 'MODIFICACION';
}

export interface Subject {
  id: string;
  rut: string;
  fullName: string;
  alias: string;
  birthDate: string;
  nationality: string;
  riskLevel: RiskLevel;
  
  // Investigation Status Logic
  investigationStatus: 'ABIERTA' | 'LIBERADA';
  ownerDepartment: Department; // The department that "owns" the investigation
  ownerRegionSection: string;  // Detailed contact info for the owner
  
  // Status Logic
  status: 'ACTIVO' | 'INACTIVO'; // System status
  legalStatus: 'LIBERTAD' | 'DETENIDO' | 'CENTRO PENITENCIARIO'; // Estado Procesal Real
  legalStatusUpdatedAt: string; // Fecha actualización estado procesal
  currentPrison?: string; // If legalStatus is CENTRO PENITENCIARIO

  imageUrl?: string;
  
  // Criminal Organization Info
  belongsToCriminalOrg: boolean;
  criminalOrgName?: string;
  criminalOrgRegion?: string;
  criminalOrgCommune?: string;
  
  // Extended Personal Info & Gender Identity (Ley 21.120)
  sex: 'HOMBRE' | 'MUJER' | 'INTERSEXUAL' | 'OTRO'; // Sexo Biológico/Asignado
  registralSex?: 'MASCULINO' | 'FEMENINO' | 'NO BINARIO'; // Sexo Registral (Cédula)
  genderIdentity?: string; // Identidad de Género (Autopercibida)
  
  civilStatus?: string;
  partnerName?: string;
  partnerRut?: string;
  hasChildren: boolean;
  children?: Child[];

  address1?: string;
  address2?: string;
  address3?: string;
  observations?: string; 
  
  // Arrays for detailed tables
  entries: InvestigationEntry[]; // Bitácora
  policeRecords?: PoliceRecord[];
  associates?: Associate[];
  criminalRecords?: CriminalRecord[];
  complaints?: Complaint[]; // Denuncias
  publicMinistryCauses?: PublicMinistryCause[];
  gendarmerieRecords?: GendarmerieRecord[];
  internationalMovements?: InternationalMovement[];
  otherBackgrounds?: OtherBackground[];
  newsLinks?: NewsLink[];
  
  // Assets & Findings
  vehicles?: Vehicle[];
  knownAddresses?: SubjectAddress[];
  socialMedia?: SocialMedia[];
  phones?: Phone[];
  accessLogs?: AccessLogEntry[]; // Auditoría de acceso
  
  aiAnalysis?: string;
}

export interface OfficerContext {
  name: string;
  rank: string;
  department: Department;
  regionSection: string; 
}

export interface InvestigationEntry {
  id: string;
  content: string;
  createdAt: string; 
  officerName: string; // Quien registra en el sistema (Login)
  requestorName?: string; // Quien solicita la actualización (Nuevo requerimiento)
  department: Department;
  regionSection: string;
  type: 'ANTECEDENTE' | 'DILIGENCIA' | 'DETENCION' | 'ACTUALIZACION';
  relatedImageUrl?: string; 
}