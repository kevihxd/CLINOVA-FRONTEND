import ConstructionPage from '../components/ConstructionPage';
import { HojaVida } from '../modules/talentoHumano/pages/HojaVida';
import { Organigrama } from '../modules/talentoHumano/pages/Organigrama';
import { VerDetalleCargo } from '../modules/talentoHumano/pages/VerDetalleCargo';
import { TipoDocumento } from '../modules/talentoHumano/pages/TipoDocumento'; 
import { MapaProcesos } from '../modules/procesos/pages/MapaProcesos';
import { TipoDocumentos } from '../modules/procesos/pages/TipoDocumentos'; 
import { ListadoUnico } from '../modules/procesos/pages/ListadoUnico'; 
import { CrearDocumentoForm } from '../modules/procesos/pages/CrearDocumento'; 
import { PerfilesCargos } from '../modules/procesos/pages/PerfilesCargos';
import { SolicitarDocumento } from '../modules/calidad/pages/SolicitarDocumento';
import { RevisionDocumento } from '../modules/calidad/pages/RevisionDocumento';
import { Reporte } from '../modules/calidad/pages/Reporte';
import { PapeleraReciclaje } from '../modules/calidad/pages/PapeleraReciclaje';
import { ListadosUnicos } from '../modules/calidad/pages/ListadosUnicos';
import { DocumentosExternos } from '../modules/calidad/pages/DocumentosExternos';
import { DiligenciarFormato } from '../modules/calidad/pages/DiligenciarFormato';
import { Definiciones } from '../modules/calidad/pages/Definiciones';
import { MiPerfil } from '../modules/miCuenta/pages/MiPerfil';
import { TipoContrato } from '../modules/configuracion/pages/TipoContrato';
import { Usuarios } from '../modules/configuracion/pages/Usuarios';
import { GestionCargos } from '../modules/configuracion/pages/GestionCargos';
import { GestionActas } from '../modules/actasInformes/pages/GestionActas';
import { CrearPlantilla } from '../modules/actasInformes/pages/CrearPlantilla';
import { CrearActa } from '../modules/actasInformes/pages/CrearActa';
import { AdministracionVacunas } from '../modules/configuracion/pages/AdministracionVacunas';

export const ROUTES = {
  MI_CUENTA: {
    MI_PERFIL: { path: '/miCuenta/mi-perfil', title: 'Mi Perfil', element: <MiPerfil /> },
  },
  TALENTO_HUMANO: {
    HOJA_VIDA: { path: '/talentoHumano/hoja-de-vida', title: 'Hoja de Vida', element: <HojaVida /> },
    ORGANIGRAMA: { path: '/talentoHumano/organigrama', title: 'Organigrama', element: <Organigrama /> },
    VER_DETALLE: { path: '/talentoHumano/perfiles-cargo/:id', title: 'Detalle de Cargo', element: <VerDetalleCargo /> },
    TIPO_DOCUMENTO: { path: '/talentoHumano/tipo-documento', title: 'Tipo de Documento', element: <TipoDocumento /> },
  },
  PROCESOS: {
    MAPA_PROCESOS: { path: '/procesos/mapa', title: 'Mapa de Procesos', element: <MapaProcesos /> },
    TIPOS_DOCUMENTOS: { path: '/procesos/tipos-documentos', title: 'Tipos de Documento', element: <TipoDocumentos /> }, 
    LISTADO_UNICO: { path: '/procesos/listado-unico', title: 'Listado Único', element: <ListadoUnico /> },
    CREAR_DOCUMENTO: { path: '/procesos/crear-documento', title: 'Crear Documento', element: <CrearDocumentoForm /> },
    PERFILES_CARGO: { path: '/procesos/perfiles-cargo', title: 'Perfiles de Cargo', element: <PerfilesCargos /> },
  },
  CALIDAD: {
    SOLICITAR_DOCUMENTO: { path: '/calidad/solicitar-documento', title: 'Solicitar Documento', element: <SolicitarDocumento /> },
    REVISION_DOCUMENTO: { path: '/calidad/revision-documento', title: 'Revisión por documento', element: <RevisionDocumento /> },
    REPORTES: { path: '/calidad/reportes', title: 'Reportes de Calidad', element: <Reporte /> },
    PAPELERA: { path: '/calidad/papelera-reciclaje', title: 'Papelera de Reciclaje', element: <PapeleraReciclaje /> },
    LISTADO_UNICO: { path: '/calidad/listado-unico', title: 'Listado Único', element: <ListadosUnicos /> },
    DOCUMENTOS_EXTERNOS: { path: '/calidad/documentos-externos', title: 'Documentos Externos', element: <DocumentosExternos /> },
    DILIGENCIAR_FORMATO: { path: '/calidad/diligenciar-formato', title: 'Diligenciar Formato', element: <DiligenciarFormato /> },
    DEFINICIONES: { path: '/calidad/definiciones', title: 'Definiciones', element: <Definiciones /> },
  },
  CONFIGURACION: {
    USUARIOS: { path: '/configuracion/usuarios', title: 'Gestión de Usuarios', element: <Usuarios /> },
    MACROPROCESOS: { path: '/configuracion/macroprocesos', title: 'Gestión de Macroprocesos', element: <ConstructionPage title="Gestión de Macroprocesos" /> },
    GRUPOS_DISTRIBUCION: { path: '/configuracion/grupos-distribucion', title: 'Grupos de Distribución', element: <ConstructionPage title="Grupos de Distribución" /> },
    CARGOS: { path: '/configuracion/cargos', title: 'Gestión de Cargos', element: <GestionCargos /> },
    TIPO_CONTRATO: { path: '/configuracion/tipo-contrato', title: 'Gestión de Tipo Contrato', element: <TipoContrato title="Gestión de Tipo Contrato" /> },
    VACUNAS: { path: '/configuracion/vacunas', title: 'Administración de Vacunas', element: <AdministracionVacunas /> }
  },
  ACTAS_INFORMES: {
    GESTION_ACTAS: { path: '/actas-informes/gestion-actas', title: 'Gestión de Actas', element: <GestionActas /> },
    CREAR_PLANTILLA: { path: '/actas-informes/crear-plantilla', title: 'Crear Plantilla', element: <CrearPlantilla /> },
    CREAR_ACTA: { path: '/actas-informes/crear-acta', title: 'Crear Acta', element: <CrearActa /> }
  },
};