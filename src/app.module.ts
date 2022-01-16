import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlayerService } from './player/player.service';
import { FilterService } from './filter/filter.service';

@Module({
  imports: [HttpModule.register({ headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36' } })],
  controllers: [AppController],
  providers: [AppService, PlayerService, FilterService],
})
export class AppModule { }
