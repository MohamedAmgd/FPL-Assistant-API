import { Injectable } from '@nestjs/common';
import { FilterOptions } from './filter/filter-options';
import { FilterService } from './filter/filter.service';
import { Player } from './player/entities/player.entity';
import { PlayerService } from './player/player.service';


@Injectable()
export class AppService {
  constructor(
    private readonly playerService: PlayerService,
    private readonly filterService: FilterService
  ) { }

  async getAllPlayers(filterOptions: FilterOptions): Promise<Player[]> {
    let players = await this.playerService.getAllPlayers();
    return this.filterService.filterAndSortList(players, filterOptions);
  }

}
