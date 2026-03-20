import { TalentoHumanoOptions, TALENTO_HUMANO_OPTIONS } from '../../talentoHumano/components/TalentoHumanoOptions';
import { CalidadOptions, CALIDAD_OPTIONS } from '../../calidad/components/CalidadOptions';
import { ConfiguracionOptions, CONFIGURACION_OPTIONS } from '../../configuracion/components/ConfiguracionOptions';
import { ProcesosOptions, PROCESOS_OPTIONS } from '../../configuracion/components/ProcesosOptions';

export const OPTIONS_MAP = {
    '1': TalentoHumanoOptions,
    '2': CalidadOptions,
    '3': ProcesosOptions,
    '4': ProcesosOptions,
    '5': ConfiguracionOptions,
    '6': ProcesosOptions,
};

export const DATA_MAP = {
    '1': TALENTO_HUMANO_OPTIONS,
    '2': CALIDAD_OPTIONS,
    '3': PROCESOS_OPTIONS,
    '4': PROCESOS_OPTIONS,
    '5': CONFIGURACION_OPTIONS,
    '6': PROCESOS_OPTIONS,
};