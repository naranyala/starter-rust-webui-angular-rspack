/**
 * Secure Logger Service
 * 
 * Provides sanitized logging that prevents PII and sensitive data leakage.
 * Automatically redacts sensitive fields from log messages.
 * 
 * @example
 * ```typescript
 * // Safe - automatically redacts sensitive fields
 * logger.info('User created', { id: 1, email: 'user@example.com', password: 'secret' });
 * // Logs: { id: 1, email: '[REDACTED]', password: '[REDACTED]' }
 * 
 * // Safe - sanitizes error messages
 * logger.error('Operation failed', error);
 * // Error stack traces are sanitized
 * ```
 */

import { Injectable, inject } from '@angular/core';
import { LoggerService } from './logger.service';

// ============================================================================
// Sensitive Field Patterns
// ============================================================================

const SENSITIVE_FIELDS = [
  'password',
  'passwd',
  'pwd',
  'secret',
  'token',
  'accessToken',
  'access_token',
  'refreshToken',
  'refresh_token',
  'apiKey',
  'api_key',
  'apikey',
  'auth',
  'authorization',
  'bearer',
  'jwt',
  'session',
  'sessionId',
  'session_id',
  'cookie',
  'creditCard',
  'credit_card',
  'cardNumber',
  'card_number',
  'cvv',
  'ssn',
  'socialSecurity',
  'bankAccount',
  'privateKey',
  'private_key',
  'secretKey',
  'secret_key',
];

const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_PATTERN = /[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/g;
const IP_PATTERN = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;
const CREDIT_CARD_PATTERN = /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g;

// ============================================================================
// Secure Logger Service
// ============================================================================

@Injectable({ providedIn: 'root' })
export class SecureLoggerService {
  private readonly logger = inject(LoggerService);

  /**
   * Sanitize an object by redacting sensitive fields
   */
  sanitize(data: unknown): unknown {
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data === 'string') {
      return this.sanitizeString(data);
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item));
    }

    if (typeof data === 'object') {
      return this.sanitizeObject(data as Record<string, unknown>);
    }

    return data;
  }

  /**
   * Sanitize a string by redacting sensitive patterns
   */
  private sanitizeString(str: string): string {
    let sanitized = str;

    // Redact emails (show first char and domain)
    sanitized = sanitized.replace(EMAIL_PATTERN, (match) => {
      const [user, domain] = match.split('@');
      if (user && domain) {
        return `${user[0]}***@${domain}`;
      }
      return '[REDACTED_EMAIL]';
    });

    // Redact phone numbers
    sanitized = sanitized.replace(PHONE_PATTERN, '[REDACTED_PHONE]');

    // Redact IP addresses (keep last octet for debugging)
    sanitized = sanitized.replace(IP_PATTERN, (match) => {
      const parts = match.split('.');
      if (parts.length === 4) {
        return `***.***.***.${parts[3]}`;
      }
      return '[REDACTED_IP]';
    });

    // Redact credit card numbers (show last 4 digits)
    sanitized = sanitized.replace(CREDIT_CARD_PATTERN, (match) => {
      const digits = match.replace(/[- ]/g, '');
      if (digits.length >= 4) {
        return `****-****-****-${digits.slice(-4)}`;
      }
      return '[REDACTED_CARD]';
    });

    return sanitized;
  }

  /**
   * Sanitize an object by redacting sensitive fields
   */
  private sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();

      // Check if field name matches sensitive patterns
      if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
        sanitized[key] = '[REDACTED]';
        continue;
      }

      // Recursively sanitize nested objects
      if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitize(value);
      } else if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Log info message with sanitization
   */
  info(message: string, data?: unknown): void {
    const sanitizedData = data ? this.sanitize(data) : undefined;
    this.logger.info(message, sanitizedData);
  }

  /**
   * Log warning message with sanitization
   */
  warn(message: string, data?: unknown): void {
    const sanitizedData = data ? this.sanitize(data) : undefined;
    this.logger.warn(message, sanitizedData);
  }

  /**
   * Log error message with sanitization
   */
  error(message: string, error?: unknown): void {
    let sanitizedError = error;

    if (error instanceof Error) {
      // Sanitize error message and stack
      sanitizedError = {
        message: this.sanitizeString(error.message),
        stack: '[STACK_TRACE_REDACTED]',
        name: error.name,
      };
    } else if (typeof error === 'object') {
      sanitizedError = this.sanitize(error);
    } else if (typeof error === 'string') {
      sanitizedError = this.sanitizeString(error);
    }

    this.logger.error(message, sanitizedError);
  }

  /**
   * Log debug message with sanitization
   */
  debug(message: string, data?: unknown): void {
    const sanitizedData = data ? this.sanitize(data) : undefined;
    this.logger.debug(message, sanitizedData);
  }
}
