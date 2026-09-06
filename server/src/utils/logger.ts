type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private format(level: LogLevel, message: string, context?: any) {
    const timestamp = new Date().toISOString();
    const meta = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${meta}`;
  }

  info(message: string, context?: any) {
    console.log(this.format('info', message, context));
  }

  warn(message: string, context?: any) {
    console.warn(this.format('warn', message, context));
  }

  error(message: string, context?: any) {
    console.error(this.format('error', message, context));
  }

  debug(message: string, context?: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.format('debug', message, context));
    }
  }
}

export const logger = new Logger();
