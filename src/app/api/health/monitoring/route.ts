/**
 * Health Check API with Monitoring Integration
 * Provides comprehensive system status for uptime monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logError, logMessage, addBreadcrumb } from '@/lib/monitoring';

// Create admin client for health checks
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  environment: string;
  version: string;
  uptime: number;
  checks: {
    database: {
      status: 'ok' | 'error';
      responseTime: number;
      details?: string;
    };
    authentication: {
      status: 'ok' | 'error';
      responseTime: number;
      details?: string;
    };
    external_services: {
      status: 'ok' | 'error';
      services: {
        yoco: 'ok' | 'error' | 'unknown';
        sentry: 'ok' | 'error' | 'unknown';
      };
    };
  };
  metrics: {
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    nodejs: {
      version: string;
      uptime: number;
    };
  };
}

export async function GET(request: NextRequest): Promise<NextResponse<HealthStatus>> {
  const startTime = Date.now();
  
  addBreadcrumb('Health check started', 'health', {
    userAgent: request.headers.get('user-agent'),
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
  });

  try {
    // Initialize health status
    const health: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      version: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 8) || 'development',
      uptime: Date.now() - startTime,
      checks: {
        database: { status: 'ok', responseTime: 0 },
        authentication: { status: 'ok', responseTime: 0 },
        external_services: {
          status: 'ok',
          services: {
            yoco: 'unknown',
            sentry: 'unknown',
          },
        },
      },
      metrics: {
        memory: {
          used: 0,
          total: 0,
          percentage: 0,
        },
        nodejs: {
          version: process.version,
          uptime: process.uptime(),
        },
      },
    };

    // Check database connectivity
    const dbStart = Date.now();
    try {
      const { data: profilesCount, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (error) {
        throw error;
      }

      health.checks.database = {
        status: 'ok',
        responseTime: Date.now() - dbStart,
        details: `${profilesCount || 0} profiles`,
      };

      addBreadcrumb('Database check passed', 'health', {
        responseTime: health.checks.database.responseTime,
        profilesCount,
      });
    } catch (error) {
      health.checks.database = {
        status: 'error',
        responseTime: Date.now() - dbStart,
        details: error instanceof Error ? error.message : 'Unknown database error',
      };
      health.status = 'degraded';
      logError(error instanceof Error ? error : new Error(String(error)), {
        check: 'database',
        responseTime: health.checks.database.responseTime,
      });
    }

    // Check authentication system
    const authStart = Date.now();
    try {
      const { data, error } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1,
      });

      if (error) {
        throw error;
      }

      health.checks.authentication = {
        status: 'ok',
        responseTime: Date.now() - authStart,
        details: `${data.users.length} users found`,
      };

      addBreadcrumb('Auth check passed', 'health', {
        responseTime: health.checks.authentication.responseTime,
      });
    } catch (error) {
      health.checks.authentication = {
        status: 'error',
        responseTime: Date.now() - authStart,
        details: error instanceof Error ? error.message : 'Unknown auth error',
      };
      health.status = 'degraded';
      logError(error instanceof Error ? error : new Error(String(error)), {
        check: 'authentication',
        responseTime: health.checks.authentication.responseTime,
      });
    }

    // Check external services
    health.checks.external_services.services.yoco = 
      process.env.YOCO_SECRET_KEY && process.env.YOCO_PUBLIC_KEY ? 'ok' : 'error';
    
    health.checks.external_services.services.sentry = 
      process.env.NEXT_PUBLIC_SENTRY_DSN ? 'ok' : 'error';

    if (health.checks.external_services.services.yoco === 'error' || 
        health.checks.external_services.services.sentry === 'error') {
      health.checks.external_services.status = 'error';
      if (health.status === 'healthy') {
        health.status = 'degraded';
      }
    }

    // Get memory metrics
    const memoryUsage = process.memoryUsage();
    health.metrics.memory = {
      used: memoryUsage.heapUsed,
      total: memoryUsage.heapTotal,
      percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
    };

    // Set overall uptime
    health.uptime = Date.now() - startTime;

    // Determine final status
    if (health.checks.database.status === 'error' || health.checks.authentication.status === 'error') {
      health.status = 'unhealthy';
    }

    // Log health check completion
    const level = health.status === 'healthy' ? 'info' : health.status === 'degraded' ? 'warning' : 'error';
    logMessage(`Health check completed: ${health.status}`, level, {
      responseTime: health.uptime,
      databaseStatus: health.checks.database.status,
      authStatus: health.checks.authentication.status,
      memoryUsage: health.metrics.memory.percentage,
    });

    // Return appropriate HTTP status
    const httpStatus = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;

    return NextResponse.json(health, { 
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    logError(error instanceof Error ? error : new Error(String(error)), {
      check: 'health_endpoint',
      responseTime: Date.now() - startTime,
    });

    const errorHealth: HealthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      version: 'error',
      uptime: Date.now() - startTime,
      checks: {
        database: { status: 'error', responseTime: 0, details: 'Health check failed' },
        authentication: { status: 'error', responseTime: 0, details: 'Health check failed' },
        external_services: {
          status: 'error',
          services: { yoco: 'error', sentry: 'error' },
        },
      },
      metrics: {
        memory: { used: 0, total: 0, percentage: 0 },
        nodejs: { version: process.version, uptime: process.uptime() },
      },
    };

    return NextResponse.json(errorHealth, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json',
      },
    });
  }
}
