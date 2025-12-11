/**
 * Logger profesional - usa console en cliente y servidor
 * Para evitar problemas con pino en SSR, usamos console con formato estructurado
 */
const logger = {
  error: (obj: unknown, msg?: string) => {
    if (process.env.NODE_ENV === 'production') {
      // En producción, solo loguear errores críticos
      console.error(msg || obj, obj);
    } else {
      // En desarrollo, loguear con más detalle
      console.error(`[ERROR] ${msg || ''}`, obj);
    }
  },
  info: (obj: unknown, msg?: string) => {
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[INFO] ${msg || ''}`, obj);
    }
  },
  warn: (obj: unknown, msg?: string) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[WARN] ${msg || ''}`, obj);
    }
  },
  debug: (obj: unknown, msg?: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${msg || ''}`, obj);
    }
  },
};

export { logger };

/**
 * Helpers para logging con contexto
 */
export const logError = (message: string, error?: unknown, context?: Record<string, unknown>) => {
  logger.error(
    {
      err: error instanceof Error ? error : new Error(String(error)),
      ...context,
    },
    message
  );
};

export const logInfo = (message: string, context?: Record<string, unknown>) => {
  logger.info(context, message);
};

export const logWarn = (message: string, context?: Record<string, unknown>) => {
  logger.warn(context, message);
};

export const logDebug = (message: string, context?: Record<string, unknown>) => {
  logger.debug(context, message);
};
