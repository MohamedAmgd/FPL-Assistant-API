import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [HttpModule.register({ headers: { 'User-Agent': 'Chrome/94.0.4606.81' } })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
