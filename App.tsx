import React, { useState, useRef, useEffect } from 'react';
import { 
  Shield, 
  Search, 
  UserPlus, 
  FileText, 
  LogOut, 
  AlertTriangle,
  MapPin,
  Clock,
  BrainCircuit,
  Save,
  Plus,
  Camera,
  Upload,
  X,
  Edit2,
  Car,
  Home,
  Smartphone,
  Globe,
  Users,
  Link as LinkIcon,
  Gavel,
  FileWarning,
  RefreshCw,
  Lock,
  Unlock,
  EyeOff,
  Printer,
  History
} from 'lucide-react';
import { Department, OfficerContext, Subject, InvestigationEntry, RiskLevel, CHILE_REGIONS, PoliceRecord, Associate, GendarmerieRecord, CriminalRecord, InternationalMovement, Vehicle, SubjectAddress, SocialMedia, Phone, Complaint, PublicMinistryCause, OtherBackground, NewsLink, Child, AccessLogEntry } from './types';
import { generateSubjectProfile } from './services/gemini';

// --- MOCK DATA INITIALIZATION ---
const MOCK_SUBJECTS: Subject[] = [
  {
    id: '0001-2024',
    rut: '17.005.477-6',
    fullName: 'FRANCISCO EDUARDO CACERES CASTILLO',
    alias: 'El Pancho',
    birthDate: '1988-12-12',
    nationality: 'CHILENA',
    sex: 'HOMBRE',
    registralSex: 'MASCULINO',
    genderIdentity: 'MASCULINA',
    civilStatus: 'SOLTERO',
    riskLevel: RiskLevel.EXTREME,
    investigationStatus: 'ABIERTA',
    ownerDepartment: Department.OS7,
    ownerRegionSection: 'Sección Análisis OS7 Santiago',
    status: 'ACTIVO',
    legalStatus: 'DETENIDO',
    legalStatusUpdatedAt: '2023-12-20',
    belongsToCriminalOrg: true,
    criminalOrgName: 'TREN DE ARAGUA (CÉLULA SUR)',
    criminalOrgRegion: 'Biobío',
    criminalOrgCommune: 'Concepción',
    hasChildren: false,
    address1: 'PASAJE PADRE JUAN SWOBODA 0288, LA GRANJA',
    observations: 'DETENIDO 20.12.2023 EN ARGENTINA CON 8 ARMAS DE FUEGO (GENDARMERIA ARGENTINA)',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    entries: [
      {
        id: 'e1',
        type: 'DETENCION',
        content: 'Detenido en Ruta 5 Sur Km 476, Comuna de Cabrero. Se detectan 8 pistolas calibre 9mm (Glock, Bersa, Taurus).',
        createdAt: '2023-12-20T10:00:00Z',
        officerName: 'Gendarmería Argentina',
        department: Department.OTHER,
        regionSection: 'Internacional - Argentina'
      }
    ],
    policeRecords: [
      { type: 'DETENIDO', crime: 'OTROS DELITOS DE LA LEY 20.000', unit: 'RETEN EL PERAL', date: '15-12-2022', reportNumber: '22121' },
    ],
    criminalRecords: [
      { crime: 'VIOLACION DE MORADA', tribunal: 'JDO. GARANTIA DE SAN ANTONIO', year: '2007' },
    ],
    complaints: [
        { institution: 'CARABINEROS', type: 'DENUNCIA', crime: 'AMENAZAS', date: '2023-01-01', observations: 'Amenaza con arma de fuego a vecino' }
    ],
    publicMinistryCauses: [
        { ruc: '1700078766-3', prosecution: 'PUERTO MONTT', status: 'TERMINADO', crime: 'LESIONES LEVES' }
    ],
    newsLinks: [
        { source: 'BIOBIO.CL', url: 'https://www.biobiochile.cl/noticias' }
    ],
    otherBackgrounds: [
        { date: '20-12-2023', situation: 'DETENCION', place: 'RUTA 5 SUR KM 476', circumstances: 'Dos chilenos detenidos en bus', seizedItems: '08 Pistolas Marca Glock, Bersa y Taurus' }
    ],
    accessLogs: [
      { timestamp: '2023-12-21T09:00:00Z', user: 'Capitán Juan Pérez', department: 'OS7', action: 'VISUALIZACION' }
    ]
  }
];

// --- HELPERS ---

const TableHeader = ({ cols }: { cols: string[] }) => (
  <thead className="bg-gray-100 text-xs text-gray-700 uppercase">
    <tr>
      {cols.map((c, i) => <th key={i} className="px-3 py-2 border text-left">{c}</th>)}
    </tr>
  </thead>
);

const SectionTitle = ({ title, onAdd, disabled }: { title: string, onAdd?: () => void, disabled?: boolean }) => (
  <div className="bg-gray-200 border-l-4 border-police-800 px-3 py-1 mt-6 mb-2 flex justify-between items-center print:bg-transparent print:border-b print:border-black print:border-l-0">
    <h3 className="text-sm font-bold text-police-900 uppercase">{title}</h3>
    {onAdd && !disabled && (
      <button 
        onClick={onAdd}
        className="text-xs bg-police-700 hover:bg-police-900 text-white px-2 py-0.5 rounded flex items-center gap-1 transition-colors print:hidden"
      >
        <Plus className="h-3 w-3" /> Agregar
      </button>
    )}
  </div>
);

const Modal = ({ title, onClose, children }: { title: string, onClose: () => void, children: React.ReactNode }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 print:hidden">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
      <div className="bg-police-900 text-white px-4 py-3 flex justify-between items-center sticky top-0 z-10">
        <h3 className="font-bold">{title}</h3>
        <button onClick={onClose}><X className="h-5 w-5" /></button>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  </div>
);

// --- COMPONENTS ---

const Header = ({ officer, onLogout }: { officer: OfficerContext, onLogout: () => void }) => (
  <header className="bg-police-900 text-white shadow-lg sticky top-0 z-50 print:hidden">
    <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <Shield className="h-8 w-8 text-brand-primary" />
        <div>
          <h1 className="text-xl font-bold tracking-tight">SUBI</h1>
          <p className="text-xs text-police-500 uppercase tracking-widest">Sistema Unificado de Blancos Investigativos</p>
        </div>
      </div>
      <div className="flex items-center gap-6 text-sm">
        <div className="text-right hidden md:block">
          <div className="font-semibold text-brand-primary">{officer.department}</div>
          <div className="text-police-500">{officer.regionSection} | {officer.rank} {officer.name}</div>
        </div>
        <button 
          onClick={onLogout}
          className="p-2 hover:bg-police-800 rounded-full transition-colors"
          title="Cerrar Sesión"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </div>
  </header>
);

const LoginModal = ({ onLogin }: { onLogin: (ctx: OfficerContext) => void }) => {
  const [formData, setFormData] = useState<{
    name: string;
    rank: string;
    department: Department;
  }>({
    name: '',
    rank: '',
    department: Department.OS7
  });

  const [region, setRegion] = useState(CHILE_REGIONS[6]); 
  const [section, setSection] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.rank && section) {
      const fullContext: OfficerContext = {
        ...formData,
        regionSection: `${region} - ${section}`
      };
      onLogin(fullContext);
    }
  };

  return (
    <div className="fixed inset-0 bg-police-900/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:hidden">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-police-900 p-6 text-center border-b-4 border-brand-primary">
          <Shield className="h-12 w-12 text-white mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-white">Identificación Policial</h2>
          <p className="text-police-500 text-sm mt-1">Acceso restringido a personal autorizado</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Grado</label>
              <input 
                required
                type="text" 
                placeholder="Ej: Capitán"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                value={formData.rank}
                onChange={(e) => setFormData({...formData, rank: e.target.value})}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre y Apellido</label>
              <input 
                required
                type="text" 
                placeholder="Ej: Juan Pérez"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Departamento / Unidad Especializada</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary outline-none"
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value as Department})}
            >
              {Object.values(Department).map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Región</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary outline-none"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                {CHILE_REGIONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sección / Unidad</label>
              <input 
                required
                type="text" 
                placeholder="Ej: Sección Análisis / Brigada Sur"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary outline-none"
                value={section}
                onChange={(e) => setSection(e.target.value)}
              />
            </div>
          </div>
          <button 
            type="submit"
            className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 rounded-md transition-colors shadow-lg mt-4"
          >
            Ingresar al Sistema
          </button>
        </form>
      </div>
    </div>
  );
};

const SubjectCard: React.FC<{ subject: Subject, onSelect: (s: Subject) => void }> = ({ subject, onSelect }) => {
  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case RiskLevel.EXTREME: return 'bg-red-100 text-red-800 border-red-200';
      case RiskLevel.HIGH: return 'bg-orange-100 text-orange-800 border-orange-200';
      case RiskLevel.MEDIUM: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div 
      onClick={() => onSelect(subject)}
      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer p-4 group flex items-center gap-4 relative"
    >
      {/* Investigation Status Badge */}
      <div className={`absolute top-0 right-0 px-2 py-1 text-[10px] font-bold uppercase rounded-bl-lg rounded-tr-lg border-b border-l ${
        subject.investigationStatus === 'ABIERTA' 
          ? 'bg-red-600 text-white border-red-700' 
          : 'bg-green-600 text-white border-green-700'
      }`}>
        {subject.investigationStatus === 'ABIERTA' ? 'Inv. Abierta' : 'Inv. Liberada'}
      </div>

      <div className="h-16 w-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0 border border-gray-300 mt-2">
        {subject.imageUrl ? (
          <img src={subject.imageUrl} alt={subject.alias} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-400">
            <UserPlus className="h-6 w-6" />
          </div>
        )}
      </div>
      <div className="flex-1 mt-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-base font-bold text-gray-900 group-hover:text-brand-primary transition-colors">
              {subject.fullName}
            </h3>
            <p className="text-sm text-gray-500 font-mono">{subject.rut} | {subject.alias}</p>
          </div>
        </div>
        <div className="mt-1">
          <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getRiskColor(subject.riskLevel)}`}>
            {subject.riskLevel}
          </span>
        </div>
        <div className="text-xs text-gray-400 mt-2 flex justify-between">
           <span>Ficha: {subject.id}</span>
           <span>Actualizado: {new Date(subject.entries[subject.entries.length-1]?.createdAt || new Date()).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

// --- MAIN CONTENT VIEW ---
const SubjectDetail = ({ 
  subject, 
  officer, 
  onBack, 
  onUpdate 
}: { 
  subject: Subject, 
  officer: OfficerContext, 
  onBack: () => void, 
  onUpdate: (updatedSubject: Subject) => void 
}) => {
  const [newEntry, setNewEntry] = useState('');
  const [requestorName, setRequestorName] = useState('');
  const [entryType, setEntryType] = useState<InvestigationEntry['type']>('ANTECEDENTE');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [activeTab, setActiveTab] = useState<'FICHA' | 'BITACORA' | 'ANALISIS'>('FICHA');
  
  // Logic checks for ownership and restriction
  const isOwner = officer.department === subject.ownerDepartment;
  const isRestricted = subject.investigationStatus === 'ABIERTA' && !isOwner;

  // Track Access on Mount
  useEffect(() => {
    // Only log if not already logged recently by this user to avoid spam (simple check)
    // For this demo, we'll just update it
    const logEntry: AccessLogEntry = {
      timestamp: new Date().toISOString(),
      user: `${officer.rank} ${officer.name}`,
      department: officer.department,
      action: 'VISUALIZACION'
    };
    
    // We call onUpdate but we need to be careful not to create an infinite loop with useEffect
    // In a real app, this would be a separate API call "logAccess(id)". 
    // Here we will skip auto-update to avoid prop drilling loop issues in this mock.
    // Instead we rely on the manual actions below.
  }, [subject.id]);


  // Modal States
  type ModalType = 'NONE' | 'POLICE' | 'ASSOCIATE' | 'GENDARMERIE' | 'CRIMINAL' | 'MOVEMENT' | 'VEHICLE' | 'ADDRESS' | 'SOCIAL' | 'PHONE' | 'COMPLAINT' | 'MP_CAUSE' | 'OTHER_INFO' | 'NEWS' | 'CHILD';
  const [modalOpen, setModalOpen] = useState<ModalType>('NONE');
  
  const updatePhotoInputRef = useRef<HTMLInputElement>(null);

  const createEntry = (content: string, type: InvestigationEntry['type'] = 'ACTUALIZACION', relatedImageUrl?: string) => {
    const entry: InvestigationEntry = {
      id: Date.now().toString(),
      content: content,
      createdAt: new Date().toISOString(),
      officerName: `${officer.rank} ${officer.name}`,
      requestorName: requestorName || 'SISTEMA/MISMA UNIDAD',
      department: officer.department,
      regionSection: officer.regionSection,
      type: type,
      relatedImageUrl: relatedImageUrl
    };
    return entry;
  };

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.trim()) return;

    onUpdate({
      ...subject,
      entries: [...subject.entries, createEntry(newEntry, entryType)],
      aiAnalysis: undefined 
    });
    setNewEntry('');
    setRequestorName('');
  };

  const handleUpdatePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImageUrl = reader.result as string;
        
        // Update both the main image URL and add an entry to the Bitacora with the new photo
        const logEntry = createEntry(
          'Actualización de fotografía de perfil del sujeto.', 
          'ACTUALIZACION', 
          newImageUrl
        );

        onUpdate({
            ...subject,
            imageUrl: newImageUrl,
            entries: [...subject.entries, logEntry]
        });
      };
      reader.readAsDataURL(file);
    }
  }

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    const analysis = await generateSubjectProfile(subject);
    onUpdate({ ...subject, aiAnalysis: analysis });
    setIsGeneratingAI(false);
  };

  const toggleInvestigationStatus = () => {
    if (!isOwner) return;
    const newStatus = subject.investigationStatus === 'ABIERTA' ? 'LIBERADA' : 'ABIERTA';
    onUpdate({
      ...subject,
      investigationStatus: newStatus,
      entries: [...subject.entries, createEntry(
        `Estado de investigación cambiado a: ${newStatus}`, 
        'ACTUALIZACION'
      )]
    });
  };

  const handlePrint = () => {
    if (subject.investigationStatus === 'ABIERTA') {
      alert("No es posible imprimir una ficha con investigación en curso (Estado: ABIERTA).");
      return;
    }

    const logEntry: AccessLogEntry = {
      timestamp: new Date().toISOString(),
      user: `${officer.rank} ${officer.name}`,
      department: officer.department,
      action: 'IMPRESION'
    };

    const updatedLogs = [...(subject.accessLogs || []), logEntry];
    
    // We update the subject with the new log before printing so it shows in the printed record if we want, 
    // or just to save it.
    const updatedSubject = { ...subject, accessLogs: updatedLogs };
    onUpdate(updatedSubject);

    // Timeout to allow state update before printing (in a real app this is handled differently)
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // --- ADDERS FOR STRUCTURED DATA ---
  const updateSubjectList = <T,>(listKey: keyof Subject, item: T) => {
    const currentList = (subject[listKey] as T[]) || [];
    onUpdate({ ...subject, [listKey]: [...currentList, item] });
    setModalOpen('NONE');
  };

  const RestrictedBanner = () => (
    <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-4 rounded-r shadow-sm flex items-start gap-4 print:hidden">
      <Lock className="h-8 w-8 text-red-600 flex-shrink-0 mt-1" />
      <div>
        <h3 className="font-bold text-red-800 text-lg">ANTECEDENTES RESERVADOS</h3>
        <p className="text-red-700 text-sm">
          Esta ficha mantiene una <strong>Investigación Abierta</strong>. Se muestran solo los antecedentes principales.
        </p>
        <div className="mt-2 text-sm font-semibold text-red-900 bg-red-100 p-2 rounded inline-block">
          Contacto por nuevos antecedentes: {subject.ownerDepartment} - {subject.ownerRegionSection}
        </div>
      </div>
    </div>
  );

  const RestrictedSection = () => (
    <div className="bg-gray-50 border border-dashed border-gray-300 rounded p-6 text-center text-gray-400 italic print:hidden">
        <EyeOff className="h-8 w-8 mx-auto mb-2 opacity-50"/>
        Información restringida por unidad propietaria.
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 print:space-y-2 print:max-w-none print:p-0">
      {/* Header Navigation */}
      <div className="flex justify-between items-center print:hidden">
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-brand-primary flex items-center gap-1">
          &larr; Volver a Búsqueda
        </button>
        <div className="flex gap-2">
           {['FICHA', 'BITACORA', 'ANALISIS'].map((tab) => (
             <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${
                activeTab === tab ? 'bg-police-800 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
             >
               {tab}
             </button>
           ))}
        </div>
      </div>

      {isRestricted && <RestrictedBanner />}

      {/* FICHA TÉCNICA VIEW - PDF STYLE */}
      {activeTab === 'FICHA' && (
        <div className="bg-white rounded shadow-lg border border-gray-300 overflow-hidden print:shadow-none print:border-none">
          {/* Green Bar Header */}
          <div className="bg-brand-secondary px-6 py-3 border-b-4 border-brand-primary flex justify-between items-center print:bg-white print:text-black print:border-b-2 print:border-black print:px-0">
             <div className="flex items-center gap-4">
               <h2 className="text-white font-bold text-lg tracking-wide print:text-black">
                 FICHA DE ANTECEDENTES | {officer.department.split(' ').pop()}
               </h2>
               {/* Investigation Status Indicator */}
               <div className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-bold uppercase border print:border-black print:text-black ${
                 subject.investigationStatus === 'ABIERTA' 
                   ? 'bg-red-600 text-white border-red-400' 
                   : 'bg-white text-brand-primary border-brand-primary'
               }`}>
                 {subject.investigationStatus === 'ABIERTA' ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                 {subject.investigationStatus === 'ABIERTA' ? 'Investigación Abierta' : 'Investigación Liberada'}
               </div>
             </div>
             <div className="flex items-center gap-4 print:hidden">
               {isOwner && (
                 <button 
                  onClick={toggleInvestigationStatus}
                  className="text-xs bg-yellow-500 hover:bg-yellow-600 text-police-900 font-bold px-3 py-1 rounded shadow"
                 >
                   {subject.investigationStatus === 'ABIERTA' ? 'Liberar Ficha' : 'Cerrar Investigación'}
                 </button>
               )}
               <span className="text-white/80 text-xs font-mono font-bold tracking-widest">N° {subject.id}</span>
             </div>
             <div className="hidden print:block font-mono text-sm">
                N° FICHA: {subject.id}
             </div>
          </div>

          <div className="p-6 print:p-0 print:pt-4">
            <div className="flex flex-col md:flex-row gap-6">
               {/* Photo Area */}
               <div className="w-full md:w-48 flex-shrink-0">
                 {/* Visual Update: Rounded border and shadow */}
                 <div className="aspect-[3/4] bg-gray-200 rounded-xl shadow-lg overflow-hidden mb-4 relative group border border-gray-100 print:shadow-none print:border">
                    {subject.imageUrl ? (
                      <img src={subject.imageUrl} alt="Sujeto" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <UserPlus className="h-12 w-12" />
                      </div>
                    )}
                    
                    {/* Photo Update Overlay - Only if not restricted */}
                    {!isRestricted && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center print:hidden">
                           <button 
                             onClick={() => updatePhotoInputRef.current?.click()}
                             className="bg-white/90 p-2 rounded-full text-gray-800 hover:bg-white transition-colors shadow-lg"
                             title="Actualizar Fotografía"
                           >
                             <Camera className="h-6 w-6" />
                           </button>
                           <input 
                             ref={updatePhotoInputRef}
                             type="file"
                             accept="image/*"
                             className="hidden"
                             onChange={handleUpdatePhoto}
                           />
                      </div>
                    )}
                 </div>
                 
                 <div className="text-center print:hidden">
                   <span className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full w-full shadow-sm">
                     {subject.riskLevel}
                   </span>
                 </div>
                 <div className="text-center hidden print:block border border-black p-1 font-bold text-sm">
                    RIESGO: {subject.riskLevel}
                 </div>
               </div>

               {/* Main Data Area */}
               <div className="flex-1">
                 <div className="text-center md:text-left mb-6 print:mb-2">
                   <h1 className="text-3xl font-extrabold text-red-600 uppercase leading-tight print:text-black">
                     {subject.fullName}
                   </h1>
                   <p className="text-xs text-gray-400 mt-1 print:text-gray-600">Unidad Propietaria: {subject.ownerDepartment} ({subject.ownerRegionSection})</p>
                 </div>

                 <SectionTitle title="Antecedentes Personales" />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm border p-4 bg-gray-50/50 relative group print:bg-transparent print:border-black print:text-xs">
                    <div className="grid grid-cols-[130px_1fr] gap-2">
                       <span className="font-bold text-gray-700">R.U.N.:</span>
                       <span className="font-mono">{subject.rut}</span>
                       <span className="font-bold text-gray-700">NACIMIENTO:</span>
                       <span>{subject.birthDate}</span>
                       <span className="font-bold text-gray-700">EDAD:</span>
                       <span>{new Date().getFullYear() - new Date(subject.birthDate).getFullYear()} Años</span>
                       <span className="font-bold text-gray-700">NACIONALIDAD:</span>
                       <span className="uppercase">{subject.nationality}</span>
                       <span className="font-bold text-gray-700">SEXO (BIOLÓGICO):</span>
                       <span className="uppercase">{subject.sex}</span>
                    </div>
                    <div className="grid grid-cols-[130px_1fr] gap-2">
                       <span className="font-bold text-gray-700">ALIAS:</span>
                       <span className="font-bold">"{subject.alias}"</span>
                       <span className="font-bold text-gray-700">SEXO REGISTRAL:</span>
                       <span className="uppercase">{subject.registralSex || 'NO REGISTRA'}</span>
                       <span className="font-bold text-gray-700">ID. GÉNERO:</span>
                       <span className="uppercase">{subject.genderIdentity || 'NO INFORMADO'}</span>
                       <span className="font-bold text-gray-700">ESTADO CIVIL:</span>
                       <span className="uppercase">
                           {subject.civilStatus || 'NO REGISTRA'}
                           {(subject.civilStatus === 'CASADO' || subject.civilStatus === 'CONVIVIENTE') && subject.partnerName && (
                               <span className="block text-xs text-gray-500 font-medium mt-0.5 print:text-black">
                                 Pareja: {subject.partnerName} ({subject.partnerRut || 'S/R'})
                               </span>
                           )}
                       </span>
                       <span className="font-bold text-gray-700">ESTADO PROC.:</span>
                       <span className={`uppercase font-bold ${subject.legalStatus === 'LIBERTAD' ? 'text-green-600' : 'text-red-600'} print:text-black`}>
                         {subject.legalStatus} {subject.legalStatus === 'CENTRO PENITENCIARIO' && subject.currentPrison ? `(${subject.currentPrison})` : ''}
                       </span>
                       <div className="col-span-2 text-[10px] text-gray-500 italic mt-0">
                         Actualizado: {subject.legalStatusUpdatedAt || 'Sin fecha'}
                       </div>

                       <span className="font-bold text-gray-700 flex items-center gap-1 mt-1">HIJOS 
                        {!isRestricted && <button onClick={() => setModalOpen('CHILD')} className="bg-gray-200 hover:bg-gray-300 rounded p-0.5 print:hidden"><Plus className="h-3 w-3"/></button>}
                        :</span>
                       <span className="uppercase mt-1">
                          {subject.hasChildren ? 
                            (subject.children && subject.children.length > 0 ? 
                              subject.children.map(c => c.fullName).join(', ') : 'SI (Sin registro)') 
                            : 'NO'
                          }
                       </span>
                    </div>

                    {/* CRIMINAL ORG SECTION */}
                    {subject.belongsToCriminalOrg && (
                      <div className="col-span-1 md:col-span-2 mt-2 pt-2 border-t border-gray-200 bg-red-50 p-2 print:bg-transparent print:border-black print:border-t">
                        <div className="grid grid-cols-[130px_1fr] gap-2">
                           <span className="font-bold text-red-800 print:text-black">ORG. CRIMINAL:</span>
                           <span className="font-bold text-red-900 uppercase print:text-black">{subject.criminalOrgName}</span>
                           <span className="font-bold text-red-800 print:text-black">ORIGEN:</span>
                           <span className="uppercase text-red-900 print:text-black">{subject.criminalOrgRegion}, {subject.criminalOrgCommune}</span>
                        </div>
                      </div>
                    )}

                    <div className="col-span-1 md:col-span-2 mt-2 pt-2 border-t border-gray-200">
                       <div className="grid grid-cols-[110px_1fr] gap-2 mb-1">
                          <span className="font-bold text-gray-700">DOMICILIO:</span>
                          <span className="uppercase">{subject.address1 || 'SIN INFORMACIÓN'}</span>
                       </div>
                       {subject.observations && (
                         <div className="mt-3 p-2 bg-red-50 border border-red-100 text-red-700 font-bold text-center uppercase text-xs print:bg-transparent print:border-black print:text-black print:text-left print:p-0">
                           OBSERVACIONES: {subject.observations}
                         </div>
                       )}
                    </div>
                 </div>

                 {/* POLICE RECORDS */}
                 <SectionTitle title="Antecedentes Policiales (SCIC)" onAdd={() => setModalOpen('POLICE')} disabled={isRestricted} />
                 {isRestricted ? <RestrictedSection /> : (
                   subject.policeRecords && subject.policeRecords.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border border-gray-300 print:text-xs">
                          <TableHeader cols={['Tipo', 'Delito', 'Unidad', 'Fecha', 'Parte']} />
                          <tbody>
                            {subject.policeRecords.map((r, i) => (
                              <tr key={i} className="border-b hover:bg-gray-50">
                                <td className="px-3 py-1 font-bold">{r.type}</td>
                                <td className="px-3 py-1">{r.crime}</td>
                                <td className="px-3 py-1">{r.unit}</td>
                                <td className="px-3 py-1 whitespace-nowrap">{r.date}</td>
                                <td className="px-3 py-1 font-mono">{r.reportNumber}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                   ) : (
                      <div className="text-xs text-gray-500 italic p-2 border border-dashed text-center">Sin antecedentes policiales registrados.</div>
                   )
                 )}

                 {/* CRIMINAL RECORDS (PENALES) */}
                 <SectionTitle title="Antecedentes Penales" onAdd={() => setModalOpen('CRIMINAL')} disabled={isRestricted} />
                 {isRestricted ? <RestrictedSection /> : (
                   subject.criminalRecords && subject.criminalRecords.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border border-gray-300 print:text-xs">
                          <TableHeader cols={['Delito', 'Tribunal', 'Año']} />
                          <tbody>
                            {subject.criminalRecords.map((r, i) => (
                              <tr key={i} className="border-b hover:bg-gray-50">
                                <td className="px-3 py-1 font-bold">{r.crime}</td>
                                <td className="px-3 py-1">{r.tribunal}</td>
                                <td className="px-3 py-1 font-mono">{r.year}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                   ) : (
                      <div className="text-xs text-gray-500 italic p-2 border border-dashed text-center">Sin antecedentes penales.</div>
                   )
                 )}

                 {/* ASSOCIATES */}
                 <SectionTitle title="Compañeros de Delito" onAdd={() => setModalOpen('ASSOCIATE')} disabled={isRestricted} />
                 {isRestricted ? <RestrictedSection /> : (
                   subject.associates && subject.associates.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border border-gray-300 print:text-xs">
                          <TableHeader cols={['RUT', 'Nombre', 'Delito', 'Fecha', 'Unidad', 'Año']} />
                          <tbody>
                            {subject.associates.map((r, i) => (
                              <tr key={i} className="border-b hover:bg-gray-50">
                                <td className="px-3 py-1 font-mono text-xs">{r.rut}</td>
                                <td className="px-3 py-1 font-bold text-xs">{r.name}</td>
                                <td className="px-3 py-1 text-xs">{r.crime}</td>
                                <td className="px-3 py-1 whitespace-nowrap text-xs">{r.date}</td>
                                <td className="px-3 py-1 text-xs">{r.unit}</td>
                                <td className="px-3 py-1 text-xs">{r.year}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                   ) : (
                      <div className="text-xs text-gray-500 italic p-2 border border-dashed text-center">Sin compañeros de delito registrados.</div>
                   )
                 )}

                 {/* DENUNCIAS */}
                 <SectionTitle title="Denuncias" onAdd={() => setModalOpen('COMPLAINT')} disabled={isRestricted} />
                 {isRestricted ? <RestrictedSection /> : (
                   subject.complaints && subject.complaints.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border border-gray-300 print:text-xs">
                          <TableHeader cols={['Institución', 'Tipo', 'Delito', 'Fecha', 'Observaciones']} />
                          <tbody>
                            {subject.complaints.map((r, i) => (
                              <tr key={i} className="border-b hover:bg-gray-50">
                                <td className="px-3 py-1 font-bold text-xs">{r.institution}</td>
                                <td className="px-3 py-1 text-xs">{r.type}</td>
                                <td className="px-3 py-1 text-xs">{r.crime}</td>
                                <td className="px-3 py-1 whitespace-nowrap text-xs">{r.date}</td>
                                <td className="px-3 py-1 text-xs italic">{r.observations}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                   ) : (
                      <div className="text-xs text-gray-500 italic p-2 border border-dashed text-center">Sin denuncias registradas.</div>
                   )
                 )}

                 {/* CAUSAS MP */}
                 <SectionTitle title="Causas Ministerio Público" onAdd={() => setModalOpen('MP_CAUSE')} disabled={isRestricted} />
                 {isRestricted ? <RestrictedSection /> : (
                   subject.publicMinistryCauses && subject.publicMinistryCauses.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border border-gray-300 print:text-xs">
                          <TableHeader cols={['RUC', 'Fiscalía', 'Delito', 'Estado']} />
                          <tbody>
                            {subject.publicMinistryCauses.map((r, i) => (
                              <tr key={i} className="border-b hover:bg-gray-50">
                                <td className="px-3 py-1 font-mono text-xs">{r.ruc}</td>
                                <td className="px-3 py-1 text-xs">{r.prosecution}</td>
                                <td className="px-3 py-1 text-xs">{r.crime}</td>
                                <td className="px-3 py-1 text-xs">
                                  <span className={`px-2 py-0.5 rounded text-[10px] text-white ${r.status === 'TERMINADO' ? 'bg-gray-500' : 'bg-red-500'} print:text-black print:border print:border-black`}>
                                    {r.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                   ) : (
                      <div className="text-xs text-gray-500 italic p-2 border border-dashed text-center">Sin causas MP.</div>
                   )
                 )}

                 {/* GENDARMERIE */}
                 <SectionTitle title="Gendarmería (Historial Penal)" onAdd={() => setModalOpen('GENDARMERIE')} disabled={isRestricted} />
                 {isRestricted ? <RestrictedSection /> : (
                   subject.gendarmerieRecords && subject.gendarmerieRecords.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border border-gray-300 print:text-xs">
                          <TableHeader cols={['Unidad Penal', 'Ingreso', 'Egreso', 'Causa']} />
                          <tbody>
                            {subject.gendarmerieRecords.map((r, i) => (
                              <tr key={i} className="border-b hover:bg-gray-50">
                                <td className="px-3 py-1 text-xs">{r.penalUnit}</td>
                                <td className="px-3 py-1 whitespace-nowrap text-xs">{r.entryDate}</td>
                                <td className="px-3 py-1 whitespace-nowrap text-xs">{r.exitDate}</td>
                                <td className="px-3 py-1 text-xs">{r.exitCause}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                   ) : (
                      <div className="text-xs text-gray-500 italic p-2 border border-dashed text-center">Sin historial en Gendarmería.</div>
                   )
                 )}

                 {/* OTHER INFO */}
                 <SectionTitle title="Otros Antecedentes de Interés" onAdd={() => setModalOpen('OTHER_INFO')} disabled={isRestricted} />
                 {isRestricted ? <RestrictedSection /> : (
                   subject.otherBackgrounds && subject.otherBackgrounds.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border border-gray-300 print:text-xs">
                          <TableHeader cols={['Fecha', 'Situación', 'Lugar', 'Circunstancias', 'Especies']} />
                          <tbody>
                            {subject.otherBackgrounds.map((r, i) => (
                              <tr key={i} className="border-b hover:bg-gray-50 align-top">
                                <td className="px-3 py-1 whitespace-nowrap text-xs font-bold">{r.date}</td>
                                <td className="px-3 py-1 text-xs">{r.situation}</td>
                                <td className="px-3 py-1 text-xs">{r.place}</td>
                                <td className="px-3 py-1 text-xs">{r.circumstances}</td>
                                <td className="px-3 py-1 text-xs text-red-700 print:text-black">{r.seizedItems}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                   ) : (
                      <div className="text-xs text-gray-500 italic p-2 border border-dashed text-center">Sin otros antecedentes.</div>
                   )
                 )}

                 {/* NEWS LINKS - HIDE ON PRINT */}
                 <div className="print:hidden">
                    <SectionTitle title="Links de Noticias" onAdd={() => setModalOpen('NEWS')} disabled={isRestricted} />
                    {subject.newsLinks && subject.newsLinks.length > 0 ? (
                        <ul className="space-y-1">
                        {subject.newsLinks.map((l, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                            <LinkIcon className="h-3 w-3 text-blue-500"/>
                            <span className="font-bold">{l.source}:</span>
                            <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">{l.url}</a>
                            </li>
                        ))}
                        </ul>
                    ) : null}
                 </div>
                 
                 {/* PRINT AND AUDIT MODULE - NEW */}
                 <div className="mt-8 border-t-4 border-gray-800 pt-6 print:hidden">
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                           <Printer className="h-5 w-5" />
                           Gestión de Reportes y Auditoría
                        </h3>
                        {subject.investigationStatus === 'LIBERADA' ? (
                          <button 
                            onClick={handlePrint}
                            className="bg-brand-primary hover:bg-brand-secondary text-white px-4 py-2 rounded font-bold shadow-md flex items-center gap-2"
                          >
                             <Printer className="h-4 w-4" />
                             Imprimir Ficha Oficial
                          </button>
                        ) : (
                          <span className="text-xs font-bold bg-red-100 text-red-800 px-3 py-1 rounded border border-red-200">
                            IMPRESIÓN BLOQUEADA (Inv. Abierta)
                          </span>
                        )}
                      </div>
                      
                      <div className="bg-white border border-gray-300 rounded overflow-hidden">
                         <div className="bg-gray-200 px-3 py-2 text-xs font-bold text-gray-700 uppercase flex items-center gap-1">
                           <History className="h-3 w-3" />
                           Historial de Accesos / Impresiones
                         </div>
                         <div className="max-h-40 overflow-y-auto">
                            <table className="w-full text-xs">
                               <thead className="bg-gray-50 border-b">
                                  <tr>
                                    <th className="px-2 py-1 text-left">Fecha/Hora</th>
                                    <th className="px-2 py-1 text-left">Funcionario</th>
                                    <th className="px-2 py-1 text-left">Unidad</th>
                                    <th className="px-2 py-1 text-left">Acción</th>
                                  </tr>
                               </thead>
                               <tbody>
                                  {(subject.accessLogs || []).slice().reverse().map((log, i) => (
                                     <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="px-2 py-1 text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                                        <td className="px-2 py-1 font-medium">{log.user}</td>
                                        <td className="px-2 py-1">{log.department}</td>
                                        <td className="px-2 py-1">
                                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                            log.action === 'IMPRESION' ? 'bg-blue-100 text-blue-800' : 
                                            log.action === 'VISUALIZACION' ? 'bg-gray-100 text-gray-600' : 'bg-yellow-100 text-yellow-800'
                                          }`}>
                                            {log.action}
                                          </span>
                                        </td>
                                     </tr>
                                  ))}
                                  {(!subject.accessLogs || subject.accessLogs.length === 0) && (
                                    <tr>
                                       <td colSpan={4} className="p-2 text-center text-gray-400 italic">Sin registros de acceso.</td>
                                    </tr>
                                  )}
                               </tbody>
                            </table>
                         </div>
                      </div>
                    </div>
                 </div>

               </div>
            </div>
          </div>
        </div>
      )}

      {/* BITACORA TAB */}
      {activeTab === 'BITACORA' && (
        isRestricted ? (
          <div className="bg-white p-12 rounded shadow border text-center print:hidden">
            <Lock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800">Acceso Restringido a Bitácora</h3>
            <p className="text-gray-500 mt-2 max-w-lg mx-auto">
              El detalle de las diligencias y bitácora operativa se encuentra reservado debido al estado de <strong>Investigación Abierta</strong>.
            </p>
            <div className="mt-6 p-3 bg-red-50 text-red-800 rounded inline-block text-sm">
              Solicitar acceso a: <strong>{subject.ownerDepartment}</strong>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
           {/* ... (Bitacora Content preserved as logic, hidden in print via parent div) ... */}
           {/* Re-pasting just for context, but XML only replaces entire file content. 
               The content below is identical to previous versions but wrapped in print:hidden 
               implicitly because activeTab logic handles view, and we can add print:hidden to the container if needed.
               However, the requirement is mainly to print the 'FICHA' view. 
               If the user clicks print, they see the Ficha view printed.
           */}
           <div className="md:col-span-2 space-y-4">
             {/* New Entry Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 border-l-4 border-l-brand-primary">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Plus className="h-5 w-5 text-brand-primary" />
                Nueva Diligencia / Vinculación
              </h3>
              
              {/* Specialized Action Buttons */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                <button 
                  onClick={() => setModalOpen('VEHICLE')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-brand-primary hover:text-white rounded text-xs font-semibold text-gray-700 transition-colors border border-gray-300"
                >
                  <Car className="h-4 w-4" /> Vehículo
                </button>
                <button 
                  onClick={() => setModalOpen('ADDRESS')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-brand-primary hover:text-white rounded text-xs font-semibold text-gray-700 transition-colors border border-gray-300"
                >
                  <Home className="h-4 w-4" /> Domicilio
                </button>
                 <button 
                  onClick={() => setModalOpen('SOCIAL')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-brand-primary hover:text-white rounded text-xs font-semibold text-gray-700 transition-colors border border-gray-300"
                >
                  <Globe className="h-4 w-4" /> Red Social
                </button>
                <button 
                  onClick={() => setModalOpen('PHONE')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-brand-primary hover:text-white rounded text-xs font-semibold text-gray-700 transition-colors border border-gray-300"
                >
                  <Smartphone className="h-4 w-4" /> Teléfono
                </button>
              </div>

              <form onSubmit={handleAddEntry}>
                <div className="mb-2">
                   <label className="text-xs text-gray-500 font-medium uppercase block mb-1">Solicitado por (Opcional):</label>
                   <input 
                     value={requestorName}
                     onChange={(e) => setRequestorName(e.target.value)}
                     placeholder="Ej: Fiscal Juan Pérez / Capitán González"
                     className="w-full border border-gray-300 rounded-md p-2 text-sm outline-none mb-3"
                   />
                   <span className="text-xs text-gray-500 font-medium uppercase">Detalle:</span>
                </div>
                <textarea
                  value={newEntry}
                  onChange={(e) => setNewEntry(e.target.value)}
                  placeholder="Detalle la actualización operativa general..."
                  className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-brand-primary outline-none min-h-[80px]"
                />
                 <div className="flex justify-between items-center mt-3">
                   <div className="flex gap-2">
                    {(['ANTECEDENTE', 'DILIGENCIA', 'DETENCION', 'ACTUALIZACION'] as const).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setEntryType(t)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                          entryType === t 
                          ? 'bg-police-700 text-white' 
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <button 
                    type="submit"
                    disabled={!newEntry.trim()}
                    className="bg-brand-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-secondary disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Registrar
                  </button>
                </div>
              </form>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              {subject.entries.slice().reverse().map((entry) => (
                <div key={entry.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 relative pl-10">
                  <div className="absolute left-4 top-4 bottom-0 w-0.5 bg-gray-200 h-full"></div>
                  <div className={`absolute left-2.5 top-5 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                    entry.type === 'DETENCION' ? 'bg-red-500' : 'bg-brand-primary'
                  }`}></div>
                  <div className="flex justify-between items-start mb-1">
                     <span className={`text-xs font-bold px-2 py-0.5 rounded text-white ${
                        entry.type === 'DETENCION' ? 'bg-red-600' : 'bg-police-600'
                      }`}>{entry.type}</span>
                     <span className="text-xs text-gray-400">{new Date(entry.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-800 mt-2 whitespace-pre-line">{entry.content}</p>
                  
                  {/* Render Image if exists in Log */}
                  {entry.relatedImageUrl && (
                    <div className="mt-3 bg-gray-50 p-2 rounded border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1 font-semibold">Fotografía adjunta:</p>
                      <img src={entry.relatedImageUrl} alt="Evidencia en Bitácora" className="h-32 rounded shadow-sm object-cover" />
                    </div>
                  )}

                  <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-gray-500 flex flex-col gap-1">
                     <div className="flex justify-between">
                       <span><strong>Reg:</strong> {entry.officerName}</span>
                       <span>{entry.department}</span>
                     </div>
                     {entry.requestorName && (
                       <div className="text-brand-secondary font-medium">
                         <strong>Solicitado por:</strong> {entry.requestorName}
                       </div>
                     )}
                  </div>
                </div>
              ))}
            </div>
           </div>
           
           <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <h4 className="font-bold text-brand-secondary text-sm mb-2">Resumen de Actividad</h4>
                <div className="text-2xl font-bold text-gray-800">{subject.entries.length}</div>
                <div className="text-xs text-gray-600">Entradas registradas</div>
              </div>
           </div>
        </div>
        )
      )}

      {/* ANALYSIS TAB */}
      {activeTab === 'ANALISIS' && (
        isRestricted ? (
          <div className="bg-white p-12 rounded shadow border text-center print:hidden">
            <Lock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800">Análisis Reservado</h3>
            <p className="text-gray-500 mt-2 max-w-lg mx-auto">
              El análisis de inteligencia policial no puede ser generado o visualizado mientras la ficha mantenga una investigación abierta por otro departamento.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg border border-green-100 overflow-hidden print:hidden">
            <div className="bg-gradient-to-r from-brand-secondary to-brand-primary p-4 text-white flex justify-between items-center">
              <h3 className="font-semibold flex items-center gap-2">
                <BrainCircuit className="h-5 w-5" />
                Análisis de Inteligencia (IA)
              </h3>
            </div>
            <div className="p-6">
              {subject.aiAnalysis ? (
                <div className="prose prose-sm prose-green max-w-none">
                  <div className="text-gray-800 bg-green-50 p-6 rounded-md border border-green-100 leading-relaxed whitespace-pre-line">
                    {subject.aiAnalysis}
                  </div>
                  <div className="mt-4 flex justify-end">
                     <button 
                      onClick={handleGenerateAI} 
                      disabled={isGeneratingAI}
                      className="text-sm text-brand-secondary hover:text-brand-primary font-medium flex items-center gap-2"
                    >
                      {isGeneratingAI ? 'Regenerando...' : 'Actualizar Análisis con Nuevos Datos'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BrainCircuit className="h-12 w-12 text-brand-primary/50 mx-auto mb-4" />
                  <p className="text-gray-600 mb-6">El sistema puede generar un perfil de riesgo y análisis criminal basado en los antecedentes cargados.</p>
                  <button 
                    onClick={handleGenerateAI}
                    disabled={isGeneratingAI}
                    className="bg-brand-primary text-white px-6 py-3 rounded-md font-semibold hover:bg-brand-secondary shadow-lg flex items-center gap-2 mx-auto"
                  >
                    {isGeneratingAI ? 'Procesando...' : 'Generar Perfil IA'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      )}

      {/* --- MODALS --- */}
      {/* (MODALS are hidden via print:hidden in the Modal component definition) */}
      
      {modalOpen === 'POLICE' && (
        <Modal title="Agregar Antecedente Policial" onClose={() => setModalOpen('NONE')}>
           <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              updateSubjectList('policeRecords', {
                type: formData.get('type') as string,
                crime: formData.get('crime') as string,
                unit: formData.get('unit') as string,
                date: formData.get('date') as string,
                reportNumber: formData.get('reportNumber') as string,
              });
           }} className="space-y-3">
             <input name="type" placeholder="Tipo (ej. DETENIDO)" className="w-full border p-2 rounded" required />
             <input name="crime" placeholder="Delito" className="w-full border p-2 rounded" required />
             <input name="unit" placeholder="Unidad" className="w-full border p-2 rounded" required />
             <div className="grid grid-cols-2 gap-2">
               <input name="date" type="date" placeholder="Fecha" className="w-full border p-2 rounded" required />
               <input name="reportNumber" placeholder="N° Parte" className="w-full border p-2 rounded" required />
             </div>
             <button type="submit" className="w-full bg-brand-primary text-white py-2 rounded">Guardar</button>
           </form>
        </Modal>
      )}

      {modalOpen === 'CRIMINAL' && (
        <Modal title="Agregar Antecedente Penal" onClose={() => setModalOpen('NONE')}>
           <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              updateSubjectList('criminalRecords', {
                crime: formData.get('crime') as string,
                tribunal: formData.get('tribunal') as string,
                year: formData.get('year') as string,
              });
           }} className="space-y-3">
             <input name="crime" placeholder="Delito" className="w-full border p-2 rounded" required />
             <input name="tribunal" placeholder="Tribunal" className="w-full border p-2 rounded" required />
             <input name="year" type="number" placeholder="Año" className="w-full border p-2 rounded" required />
             <button type="submit" className="w-full bg-brand-primary text-white py-2 rounded">Guardar</button>
           </form>
        </Modal>
      )}

      {modalOpen === 'ASSOCIATE' && (
        <Modal title="Agregar Compañero de Delito" onClose={() => setModalOpen('NONE')}>
           <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              updateSubjectList('associates', {
                rut: formData.get('rut') as string,
                name: formData.get('name') as string,
                crime: formData.get('crime') as string,
                date: formData.get('date') as string,
                reportNumber: formData.get('reportNumber') as string,
                unit: formData.get('unit') as string,
                year: formData.get('year') as string,
              });
           }} className="space-y-3">
             <input name="rut" placeholder="RUT" className="w-full border p-2 rounded" required />
             <input name="name" placeholder="Nombre Completo" className="w-full border p-2 rounded" required />
             <input name="crime" placeholder="Delito" className="w-full border p-2 rounded" required />
             <div className="grid grid-cols-3 gap-2">
                 <input name="date" type="date" className="w-full border p-2 rounded" required />
                 <input name="reportNumber" placeholder="N° Parte" className="w-full border p-2 rounded" required />
                 <input name="year" placeholder="Año" className="w-full border p-2 rounded" required />
             </div>
             <input name="unit" placeholder="Unidad" className="w-full border p-2 rounded" required />
             <button type="submit" className="w-full bg-brand-primary text-white py-2 rounded">Guardar</button>
           </form>
        </Modal>
      )}

      {modalOpen === 'COMPLAINT' && (
        <Modal title="Agregar Denuncia" onClose={() => setModalOpen('NONE')}>
           <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              updateSubjectList('complaints', {
                institution: formData.get('institution'),
                type: formData.get('type') as string,
                crime: formData.get('crime') as string,
                date: formData.get('date') as string,
                observations: formData.get('observations') as string,
              });
           }} className="space-y-3">
             <select name="institution" className="w-full border p-2 rounded">
                <option value="CARABINEROS">CARABINEROS</option>
                <option value="PDI">PDI</option>
                <option value="FISCALIA">FISCALIA</option>
             </select>
             <input name="type" placeholder="Tipo (ej. DENUNCIA, QUERELLA)" className="w-full border p-2 rounded" required />
             <input name="crime" placeholder="Delito" className="w-full border p-2 rounded" required />
             <input name="date" type="date" className="w-full border p-2 rounded" required />
             <textarea name="observations" placeholder="Observaciones" className="w-full border p-2 rounded" rows={3} required />
             <button type="submit" className="w-full bg-brand-primary text-white py-2 rounded">Guardar</button>
           </form>
        </Modal>
      )}

       {modalOpen === 'MP_CAUSE' && (
        <Modal title="Agregar Causa Ministerio Público" onClose={() => setModalOpen('NONE')}>
           <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              updateSubjectList('publicMinistryCauses', {
                ruc: formData.get('ruc') as string,
                prosecution: formData.get('prosecution') as string,
                status: formData.get('status'),
                crime: formData.get('crime') as string,
              });
           }} className="space-y-3">
             <input name="ruc" placeholder="RUC" className="w-full border p-2 rounded" required />
             <input name="prosecution" placeholder="Fiscalía (ej. Fiscalía Local Centro)" className="w-full border p-2 rounded" required />
             <input name="crime" placeholder="Delito" className="w-full border p-2 rounded" required />
             <select name="status" className="w-full border p-2 rounded">
                <option value="EN TRAMITE">EN TRAMITE</option>
                <option value="TERMINADO">TERMINADO</option>
                <option value="VIGENTE">VIGENTE</option>
             </select>
             <button type="submit" className="w-full bg-brand-primary text-white py-2 rounded">Guardar</button>
           </form>
        </Modal>
      )}

      {modalOpen === 'OTHER_INFO' && (
        <Modal title="Agregar Otros Antecedentes" onClose={() => setModalOpen('NONE')}>
           <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              updateSubjectList('otherBackgrounds', {
                date: formData.get('date') as string,
                situation: formData.get('situation') as string,
                place: formData.get('place') as string,
                circumstances: formData.get('circumstances') as string,
                seizedItems: formData.get('seizedItems') as string,
              });
           }} className="space-y-3">
             <input name="date" placeholder="Fecha" type="date" className="w-full border p-2 rounded" required />
             <input name="situation" placeholder="Situación" className="w-full border p-2 rounded" required />
             <input name="place" placeholder="Lugar" className="w-full border p-2 rounded" required />
             <textarea name="circumstances" placeholder="Circunstancias del hecho" className="w-full border p-2 rounded" rows={3} required />
             <textarea name="seizedItems" placeholder="Especies Incautadas" className="w-full border p-2 rounded" rows={2} required />
             <button type="submit" className="w-full bg-brand-primary text-white py-2 rounded">Guardar</button>
           </form>
        </Modal>
      )}

      {modalOpen === 'NEWS' && (
        <Modal title="Agregar Link de Noticia" onClose={() => setModalOpen('NONE')}>
           <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              updateSubjectList('newsLinks', {
                source: formData.get('source') as string,
                url: formData.get('url') as string,
              });
           }} className="space-y-3">
             <input name="source" placeholder="Medio (ej. BioBioChile)" className="w-full border p-2 rounded" required />
             <input name="url" placeholder="URL Link" type="url" className="w-full border p-2 rounded" required />
             <button type="submit" className="w-full bg-brand-primary text-white py-2 rounded">Guardar</button>
           </form>
        </Modal>
      )}

       {modalOpen === 'GENDARMERIE' && (
        <Modal title="Agregar Historial Gendarmería" onClose={() => setModalOpen('NONE')}>
           <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              updateSubjectList('gendarmerieRecords', {
                penalUnit: formData.get('penalUnit') as string,
                entryDate: formData.get('entryDate') as string,
                exitDate: formData.get('exitDate') as string,
                exitCause: formData.get('exitCause') as string,
              });
           }} className="space-y-3">
             <input name="penalUnit" placeholder="Unidad Penal" className="w-full border p-2 rounded" required />
             <div className="grid grid-cols-2 gap-2">
               <div>
                  <label className="text-xs">Fecha Ingreso</label>
                  <input name="entryDate" type="date" className="w-full border p-2 rounded" required />
               </div>
               <div>
                  <label className="text-xs">Fecha Egreso</label>
                  <input name="exitDate" type="date" className="w-full border p-2 rounded" required />
               </div>
             </div>
             <input name="exitCause" placeholder="Causa Egreso" className="w-full border p-2 rounded" required />
             <button type="submit" className="w-full bg-brand-primary text-white py-2 rounded">Guardar</button>
           </form>
        </Modal>
      )}

      {modalOpen === 'CHILD' && (
        <Modal title="Agregar Hijo/a" onClose={() => setModalOpen('NONE')}>
           <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              updateSubjectList('children', {
                rut: formData.get('rut') as string,
                fullName: formData.get('fullName') as string,
              });
              onUpdate({...subject, hasChildren: true});
           }} className="space-y-3">
             <input name="rut" placeholder="RUT" className="w-full border p-2 rounded" required />
             <input name="fullName" placeholder="Nombre Completo" className="w-full border p-2 rounded" required />
             <button type="submit" className="w-full bg-brand-primary text-white py-2 rounded">Guardar</button>
           </form>
        </Modal>
      )}

      {/* NEW ASSET MODALS */}
      {modalOpen === 'VEHICLE' && (
        <Modal title="Registrar Vehículo" onClose={() => setModalOpen('NONE')}>
           <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              updateSubjectList('vehicles', {
                year: formData.get('year') as string,
                brand: formData.get('brand') as string,
                model: formData.get('model') as string,
                color: formData.get('color') as string,
                motor: formData.get('motor') as string,
                chassis: formData.get('chassis') as string,
                plate: formData.get('plate') as string,
              });
           }} className="space-y-3">
             <div className="grid grid-cols-2 gap-2">
               <input name="plate" placeholder="PPU (Patente)" className="w-full border p-2 rounded" required />
               <input name="year" placeholder="Año" type="number" className="w-full border p-2 rounded" />
             </div>
             <div className="grid grid-cols-2 gap-2">
               <input name="brand" placeholder="Marca" className="w-full border p-2 rounded" required />
               <input name="model" placeholder="Modelo" className="w-full border p-2 rounded" required />
             </div>
             <input name="color" placeholder="Color" className="w-full border p-2 rounded" />
             <input name="motor" placeholder="N° Motor" className="w-full border p-2 rounded" />
             <input name="chassis" placeholder="N° Chasis / VIN" className="w-full border p-2 rounded" />
             <button type="submit" className="w-full bg-brand-primary text-white py-2 rounded">Vincular Vehículo</button>
           </form>
        </Modal>
      )}

      {modalOpen === 'ADDRESS' && (
        <Modal title="Registrar Domicilio" onClose={() => setModalOpen('NONE')}>
           <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              updateSubjectList('knownAddresses', {
                street: formData.get('street') as string,
                number: formData.get('number') as string,
                intersection: formData.get('intersection') as string,
                apartment: formData.get('apartment') as string,
                observationType: formData.get('observationType') as string,
              });
           }} className="space-y-3">
             <div className="space-y-3">
                <input name="street" placeholder="1. Calle / Pasaje" className="w-full border p-2 rounded" required />
                <input name="number" placeholder="2. Numeración" className="w-full border p-2 rounded" required />
                <input name="intersection" placeholder="3. Intersección" className="w-full border p-2 rounded" />
                <input name="apartment" placeholder="4. Depto / Block / Casa" className="w-full border p-2 rounded" />
                <input name="observationType" placeholder="5. Observaciones (Condominio, Loteo, etc.)" className="w-full border p-2 rounded" />
             </div>
             <button type="submit" className="w-full bg-brand-primary text-white py-2 rounded">Vincular Domicilio</button>
           </form>
        </Modal>
      )}

      {modalOpen === 'SOCIAL' && (
        <Modal title="Registrar Red Social" onClose={() => setModalOpen('NONE')}>
           <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              updateSubjectList('socialMedia', {
                platform: formData.get('platform') as string,
                username: formData.get('username') as string,
              });
           }} className="space-y-3">
             <select name="platform" className="w-full border p-2 rounded">
               <option value="Instagram">Instagram</option>
               <option value="Facebook">Facebook</option>
               <option value="TikTok">TikTok</option>
               <option value="X (Twitter)">X (Twitter)</option>
               <option value="Telegram">Telegram</option>
               <option value="Otro">Otro</option>
             </select>
             <input name="username" placeholder="Cuenta / Usuario / Log" className="w-full border p-2 rounded" required />
             <button type="submit" className="w-full bg-brand-primary text-white py-2 rounded">Vincular RR.SS</button>
           </form>
        </Modal>
      )}

      {modalOpen === 'PHONE' && (
        <Modal title="Registrar Teléfono" onClose={() => setModalOpen('NONE')}>
           <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              updateSubjectList('phones', {
                number: formData.get('number') as string,
                company: formData.get('company') as string,
                note: formData.get('note') as string,
              });
           }} className="space-y-3">
             <input name="number" placeholder="Número Telefónico (+569...)" className="w-full border p-2 rounded" required />
             <input name="company" placeholder="Compañía (Opcional)" className="w-full border p-2 rounded" />
             <input name="note" placeholder="Nota / Contexto de hallazgo" className="w-full border p-2 rounded" />
             <button type="submit" className="w-full bg-brand-primary text-white py-2 rounded">Vincular Teléfono</button>
           </form>
        </Modal>
      )}

    </div>
  );
};

const CreateSubjectForm = ({ onCancel, onCreate, subjects, officer }: { onCancel: () => void, onCreate: (s: Subject) => void, subjects: Subject[], officer: OfficerContext }) => {
  const [formData, setFormData] = useState<Partial<Subject>>({
    fullName: '',
    rut: '',
    alias: '',
    birthDate: '',
    nationality: 'CHILENA',
    riskLevel: RiskLevel.MEDIUM,
    status: 'ACTIVO',
    legalStatus: 'LIBERTAD',
    sex: 'HOMBRE',
    registralSex: 'MASCULINO',
    genderIdentity: 'MASCULINA',
    belongsToCriminalOrg: false,
    entries: []
  });
  
  const [requestorName, setRequestorName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.rut) return;

    // Auto-generate ID based on count
    const nextNum = subjects.length + 1;
    const nextId = `${nextNum.toString().padStart(4, '0')}-${new Date().getFullYear()}`;
    
    const newSubject: Subject = {
      ...formData as Subject,
      id: nextId,
      investigationStatus: 'ABIERTA', // Default status for new subjects
      ownerDepartment: officer.department,
      ownerRegionSection: officer.regionSection,
      legalStatusUpdatedAt: new Date().toISOString().split('T')[0], // Set current date as initial status date
      entries: [{
         id: Date.now().toString(),
         type: 'ACTUALIZACION',
         content: 'Creación de Ficha en Sistema',
         createdAt: new Date().toISOString(),
         officerName: `${officer.rank} ${officer.name}`,
         requestorName: requestorName || 'SISTEMA/MISMA UNIDAD',
         department: officer.department,
         regionSection: officer.regionSection
      }],
      hasChildren: false, // Default
      accessLogs: [{
        timestamp: new Date().toISOString(),
        user: `${officer.rank} ${officer.name}`,
        department: officer.department,
        action: 'VISUALIZACION'
      }]
    };
    
    onCreate(newSubject);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 max-w-2xl mx-auto mt-10">
      <h2 className="text-2xl font-bold text-police-900 mb-6 flex items-center gap-2">
        <UserPlus className="h-6 w-6" />
        Nueva Ficha de Blanco
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
             <label className="block text-sm font-bold text-gray-700 mb-1">R.U.N. (Sin puntos ni guión)</label>
             <input 
               required
               className="w-full border border-gray-300 p-2.5 rounded focus:ring-2 focus:ring-brand-primary outline-none"
               value={formData.rut}
               onChange={e => setFormData({...formData, rut: e.target.value})}
               placeholder="12345678-9"
             />
           </div>
           <div>
             <label className="block text-sm font-bold text-gray-700 mb-1">Fecha Nacimiento</label>
             <input 
               type="date"
               required
               className="w-full border border-gray-300 p-2.5 rounded focus:ring-2 focus:ring-brand-primary outline-none"
               value={formData.birthDate}
               onChange={e => setFormData({...formData, birthDate: e.target.value})}
             />
           </div>
        </div>

        <div>
             <label className="block text-sm font-bold text-gray-700 mb-1">Nombre Completo</label>
             <input 
               required
               className="w-full border border-gray-300 p-2.5 rounded focus:ring-2 focus:ring-brand-primary outline-none uppercase"
               value={formData.fullName}
               onChange={e => setFormData({...formData, fullName: e.target.value.toUpperCase()})}
               placeholder="APELLIDO PATERNO MATERNO NOMBRES"
             />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
             <label className="block text-sm font-bold text-gray-700 mb-1">Alias / Apodo</label>
             <input 
               className="w-full border border-gray-300 p-2.5 rounded focus:ring-2 focus:ring-brand-primary outline-none"
               value={formData.alias}
               onChange={e => setFormData({...formData, alias: e.target.value})}
               placeholder='Ej: "El Pancho"'
             />
           </div>
            <div>
             <label className="block text-sm font-bold text-gray-700 mb-1">Nacionalidad</label>
             <input 
               className="w-full border border-gray-300 p-2.5 rounded focus:ring-2 focus:ring-brand-primary outline-none uppercase"
               value={formData.nationality}
               onChange={e => setFormData({...formData, nationality: e.target.value.toUpperCase()})}
             />
           </div>
        </div>

        {/* SEX AND GENDER SECTION */}
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase border-b pb-1">Identidad de Género y Sexo (Ley 21.120)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Sexo Biológico (Nacimiento)</label>
                <select 
                  className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-brand-primary outline-none text-sm"
                  value={formData.sex}
                  onChange={e => setFormData({...formData, sex: e.target.value as any})}
                >
                  <option value="HOMBRE">HOMBRE</option>
                  <option value="MUJER">MUJER</option>
                  <option value="INTERSEXUAL">INTERSEXUAL</option>
                  <option value="OTRO">OTRO</option>
                </select>
              </div>
               <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Sexo Registral (Cédula)</label>
                <select 
                  className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-brand-primary outline-none text-sm"
                  value={formData.registralSex}
                  onChange={e => setFormData({...formData, registralSex: e.target.value as any})}
                >
                  <option value="MASCULINO">MASCULINO</option>
                  <option value="FEMENINO">FEMENINO</option>
                  <option value="NO BINARIO">NO BINARIO</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Identidad de Género</label>
                <input 
                  className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-brand-primary outline-none text-sm uppercase"
                  placeholder="Ej: MASCULINA"
                  value={formData.genderIdentity}
                  onChange={e => setFormData({...formData, genderIdentity: e.target.value.toUpperCase()})}
                />
              </div>
          </div>
        </div>

        {/* CRIMINAL ORGANIZATION SECTION */}
        <div className="bg-red-50 p-4 rounded-md border border-red-200">
           <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-red-900">¿Pertenece a Organización Criminal?</label>
              <div className="flex gap-4">
                 <label className="flex items-center gap-2 text-sm">
                   <input type="radio" name="org" checked={formData.belongsToCriminalOrg === true} onChange={() => setFormData({...formData, belongsToCriminalOrg: true})} />
                   SI
                 </label>
                 <label className="flex items-center gap-2 text-sm">
                   <input type="radio" name="org" checked={formData.belongsToCriminalOrg === false} onChange={() => setFormData({...formData, belongsToCriminalOrg: false})} />
                   NO
                 </label>
              </div>
           </div>
           
           {formData.belongsToCriminalOrg && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 animate-fadeIn">
               <div className="md:col-span-2">
                 <label className="block text-xs font-bold text-red-800 mb-1">Nombre de la Organización</label>
                 <input 
                   className="w-full border border-red-300 p-2 rounded focus:ring-2 focus:ring-red-500 outline-none uppercase"
                   placeholder="Ej: TREN DE ARAGUA"
                   value={formData.criminalOrgName || ''}
                   onChange={e => setFormData({...formData, criminalOrgName: e.target.value.toUpperCase()})}
                 />
               </div>
               <div>
                 <label className="block text-xs font-bold text-red-800 mb-1">Región de Origen/Operación</label>
                 <select 
                   className="w-full border border-red-300 p-2 rounded focus:ring-2 focus:ring-red-500 outline-none"
                   value={formData.criminalOrgRegion || ''}
                   onChange={e => setFormData({...formData, criminalOrgRegion: e.target.value})}
                 >
                   <option value="">Seleccione Región</option>
                   {CHILE_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                 </select>
               </div>
               <div>
                 <label className="block text-xs font-bold text-red-800 mb-1">Comuna Principal</label>
                 <input 
                   className="w-full border border-red-300 p-2 rounded focus:ring-2 focus:ring-red-500 outline-none"
                   placeholder="Ej: Santiago Centro"
                   value={formData.criminalOrgCommune || ''}
                   onChange={e => setFormData({...formData, criminalOrgCommune: e.target.value})}
                 />
               </div>
             </div>
           )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nivel de Riesgo Inicial</label>
              <select 
                className="w-full border border-gray-300 p-2.5 rounded focus:ring-2 focus:ring-brand-primary outline-none"
                value={formData.riskLevel}
                onChange={e => setFormData({...formData, riskLevel: e.target.value as RiskLevel})}
              >
                {Object.values(RiskLevel).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            
            {/* Requestor Field */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Solicitado por (Opcional)</label>
              <input 
                 className="w-full border border-gray-300 p-2.5 rounded focus:ring-2 focus:ring-brand-primary outline-none"
                 placeholder="Ej: Fiscal Adjunto, Of. Investigador"
                 value={requestorName}
                 onChange={e => setRequestorName(e.target.value)}
               />
            </div>
        </div>
        
        <div className="pt-6 flex gap-4 justify-end border-t border-gray-100">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-md font-medium transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            className="px-6 py-2.5 bg-brand-primary text-white rounded-md hover:bg-brand-secondary font-bold shadow-md transition-all transform hover:scale-105"
          >
            Crear Ficha
          </button>
        </div>
      </form>
    </div>
  );
};


// --- MAIN APP COMPONENT ---
export default function App() {
  const [officer, setOfficer] = useState<OfficerContext | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>(MOCK_SUBJECTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'SEARCH' | 'DETAIL' | 'CREATE'>('SEARCH');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  // Filter subjects logic
  const filteredSubjects = subjects.filter(s => 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.rut.includes(searchTerm) ||
    s.alias.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.includes(searchTerm) // Also search by ID
  );

  const handleCreateSubject = (newSubject: Subject) => {
    // In Laravel this would be POST /api/subjects
    setSubjects([...subjects, newSubject]);
    setSelectedSubject(newSubject);
    setView('DETAIL');
  };

  const handleUpdateSubject = (updatedSubject: Subject) => {
    // In Laravel this would be PUT /api/subjects/{id} or POST /api/subjects/{id}/entries
    const updatedList = subjects.map(s => s.id === updatedSubject.id ? updatedSubject : s);
    setSubjects(updatedList);
    setSelectedSubject(updatedSubject);
  };

  if (!officer) {
    return <LoginModal onLogin={setOfficer} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-20">
      <Header officer={officer} onLogout={() => setOfficer(null)} />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* VIEW: SEARCH DASHBOARD */}
        {view === 'SEARCH' && (
          <div className="space-y-8">
            <div className="text-center space-y-4 py-8">
              <h2 className="text-3xl font-bold text-police-900">Búsqueda de Blancos</h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                Ingrese RUT, Nombre, Alias o N° Ficha para verificar existencia.
              </p>
              
              <div className="max-w-xl mx-auto relative">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Buscar por RUT, Nombre, Apodo, ID..."
                  className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 shadow-md focus:ring-4 focus:ring-brand-primary/20 focus:border-brand-primary outline-none text-lg transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-between items-center border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Resultados ({filteredSubjects.length})
              </h3>
              <button 
                onClick={() => setView('CREATE')}
                className="bg-brand-primary hover:bg-brand-secondary text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 shadow-sm transition-all"
              >
                <UserPlus className="h-4 w-4" />
                Nuevo Sujeto
              </button>
            </div>

            {filteredSubjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSubjects.map(subject => (
                  <SubjectCard 
                    key={subject.id} 
                    subject={subject} 
                    onSelect={(s) => {
                      setSelectedSubject(s);
                      setView('DETAIL');
                    }} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                <AlertTriangle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No se encontraron registros</p>
                <p className="text-sm text-gray-400 mt-1">Verifique los datos o cree una nueva ficha.</p>
              </div>
            )}
          </div>
        )}

        {/* VIEW: CREATE FORM */}
        {view === 'CREATE' && (
          <CreateSubjectForm 
            onCancel={() => setView('SEARCH')} 
            onCreate={handleCreateSubject} 
            subjects={subjects}
            officer={officer}
          />
        )}

        {/* VIEW: DETAIL & UPDATE */}
        {view === 'DETAIL' && selectedSubject && (
          <SubjectDetail 
            subject={selectedSubject}
            officer={officer}
            onBack={() => {
              setView('SEARCH');
              setSelectedSubject(null);
            }}
            onUpdate={handleUpdateSubject}
          />
        )}

      </main>
    </div>
  );
}