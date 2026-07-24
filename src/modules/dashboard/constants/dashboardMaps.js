import { TalentoHumanoOptions } from '../../talentoHumano/components/TalentoHumanoOptions';
import { CalidadOptions } from '../../calidad/components/CalidadOptions';
import { ConfiguracionOptions } from '../../configuracion/components/ConfiguracionOptions';
import { ProcesosOptions } from '../../procesos/components/ProcesosOptions';
import { ActasInformesOptions } from '../../actasInformes/components/ActasInformesOptions';
import { ContextoOptions } from '../../contexto/components/ContextoOptions';
import { HojaVidaOptions } from '../../hojasVida/components/HojaVidaOptions';


export const OPTIONS_MAP = {
    '1': TalentoHumanoOptions,
    '2': CalidadOptions,
    '3': ProcesosOptions,
    '5': ConfiguracionOptions,
    '6': ProcesosOptions, 
    '7': ActasInformesOptions,
    '8': ContextoOptions,
    '9': HojaVidaOptions,
};
