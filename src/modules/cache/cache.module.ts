// src/modules/cache/cache.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const store = await redisStore.redisStore({
          socket: {
            host: configService.get<string>('REDIS_CACHE_HOST', 'localhost'),
            port: configService.get<number>('REDIS_CACHE_PORT', 6379),
          },
        });

        return {
          store: store as unknown as CacheStore,
          ttl: 60 * 60, // 1 hour TTL
          max: 100, // Max items in cache
        };
      },
    }),
  ],
  exports: [CacheModule],
})
export class RedisCacheModule {}
