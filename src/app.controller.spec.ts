import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('getApiInfo', () => {
    it('should return API information', () => {
      const result = appController.getApiInfo();
      expect(result).toHaveProperty('endpoints');
      expect(result.endpoints).toHaveProperty('auth');
      expect(result.endpoints).toHaveProperty('orders');
      expect(result.endpoints).toHaveProperty('chat');
    });
  });
});
