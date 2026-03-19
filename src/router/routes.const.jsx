import ConstructionPage from '../components/ConstructionPage';
// Talento Humano
import { PerfilesCargos } from '../modules/talentoHumano/pages/PerfilesCargos';
import { HojaVida } from '../modules/talentoHumano/pages/HojaVida';
import { Organigrama } from '../modules/talentoHumano/pages/Organigrama';
import { VerDetalleCargo } from '../modules/talentoHumano/pages/VerDetalleCargo';
// calidad
import { TipoDocumentos } from '../modules/calidad/pages/TipoDocumentos';
import { SolicitarDocumento } from '../modules/calidad/pages/SolicitarDocumento';
import { RevisionDocumento } from '../modules/calidad/pages/RevisionDocumento';
import { Reporte } from '../modules/calidad/pages/Reporte';
import { PapeleraReciclaje } from '../modules/calidad/pages/PapeleraReciclaje';
import { ListadosUnicos } from '../modules/calidad/pages/ListadosUnicos';
import { DocumentosExternos } from '../modules/calidad/pages/DocumentosExternos';
import { DiligenciarFormato } from '../modules/calidad/pages/DiligenciarFormato';
import { Definiciones } from '../modules/calidad/pages/Definiciones';
//miCuenta
import { MiPerfil } from '../modules/miCuenta/pages/MiPerfil';

//configuracion
import { TipoDocumento } from '../modules/configuracion/pages/TipoDocumento';
import { TipoContrato } from '../modules/configuracion/pages/TipoContrato';
import { Usuarios } from '../modules/configuracion/pages/Usuarios';

export const ROUTES = {
  MI_CUENTA: {
    MI_PERFIL: {
      path: '/miCuenta/mi-perfil',
      title: 'Mi Perfil',
      element: <MiPerfil />,
    },
  },
  TALENTO_HUMANO: {
    PERFIL_CARGO: {
      path: '/talentoHumano/perfiles-cargo',
      title: 'Perfiles de Cargo',
      element: <PerfilesCargos />,
    },
    HOJA_VIDA: {
      path: '/talentoHumano/hoja-de-vida',
      title: 'Hoja de Vida',
      element: <HojaVida />,
    },
    ORGANIGRAMA: {
      path: '/talentoHumano/organigrama',
      title: 'Organigrama',
      element: <Organigrama />,
    },
    VER_DETALLE: {
      path: '/talentoHumano/perfiles-cargo/:id',
      title: 'Detalle de Cargo',
      element: <VerDetalleCargo />,
    },
  },

  CALIDAD: {
    TIPOS_DOCUMENTO: {
      path: '/calidad/tipos-documento',
      title: 'Tipos de Documento',
      element: <TipoDocumentos />,
    },
    SOLICITAR_DOCUMENTO: {
      path: '/calidad/solicitar-documento',
      title: 'Solicitar Documento',
      element: <SolicitarDocumento />,
    },
    REVISION_DOCUMENTO: {
      path: '/calidad/revision-documento',
      title: 'Revisión por documento',
      element: <RevisionDocumento />,
    },
    REPORTES: {
      path: '/calidad/reportes',
      title: 'Reportes de Calidad',
      element: <Reporte />,
    },
    PAPELERA: {
      path: '/calidad/papelera-reciclaje',
      title: 'Papelera de Reciclaje',
      element: <PapeleraReciclaje />,
    },
    LISTADO_UNICO: {
      path: '/calidad/listado-unico',
      title: 'Listado Único',
      element: <ListadosUnicos />,
    },
    DOCUMENTOS_EXTERNOS: {
      path: '/calidad/documentos-externos',
      title: 'Documentos Externos',
      element: <DocumentosExternos />,
    },
    DILIGENCIAR_FORMATO: {
      path: '/calidad/diligenciar-formato',
      title: 'Diligenciar Formato',
      element: <DiligenciarFormato />,
    },
    DEFINICIONES: {
      path: '/calidad/definiciones',
      title: 'Definiciones',
      element: <Definiciones />,
    },
  },

  CONFIGURACION: {
    USUARIOS: {
      path: '/configuracion/usuarios',
      title: 'Gestión de Usuarios',
      element: <Usuarios />,
    },
    PROCESOS: {
      path: '/configuracion/procesos',
      title: 'Gestión de Procesos',
      element: <ConstructionPage title="Gestión de Procesos" />,
    },
    MACROPROCESOS: {
      path: '/configuracion/macroprocesos',
      title: 'Gestión de Macroprocesos',
      element: <ConstructionPage title="Gestión de Macroprocesos" />,
    },
    GRUPOS_DISTRIBUCION: {
      path: '/configuracion/grupos-distribucion',
      title: 'Grupos de Distribución',
      element: <ConstructionPage title="Grupos de Distribución" />,
    },
    CARGOS: {
      path: '/configuracion/cargos',
      title: 'Gestión de Cargos',
      element: <ConstructionPage title="Gestión de Cargos" />,
    },
    TIPO_DOCUMENTO: {
      path: '/configuracion/tipo-documento',
      title: 'Gestión de Tipo Documento',
      element: <TipoDocumento title="Gestión de Tipo Documento" />,
    },
    TIPO_CONTRATO: {
      path: '/configuracion/tipo-contrato',
      title: 'Gestión de Tipo Contrato',
      element: <TipoContrato title="Gestión de Cargos" />,
    },
  },
};
