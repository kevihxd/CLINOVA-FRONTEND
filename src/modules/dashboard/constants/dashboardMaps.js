
import { TalentoHumanoOptions, TALENTO_HUMANO_OPTIONS } from '../../talentoHumano/components/TalentoHumanoOptions';
import { CalidadOptions, CALIDAD_OPTIONS } from '../../calidad/components/CalidadOptions';
import { ConfiguracionOptions, CONFIGURACION_OPTIONS } from '../../configuracion/components/ConfiguracionOptions';

export const OPTIONS_MAP = {
    '1': TalentoHumanoOptions,
    '2': CalidadOptions,
    '5': ConfiguracionOptions,
};

export const DATA_MAP = {
    '1': TALENTO_HUMANO_OPTIONS,
    '2': CALIDAD_OPTIONS,
    '5': CONFIGURACION_OPTIONS,
};
