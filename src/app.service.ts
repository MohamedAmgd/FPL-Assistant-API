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
    let players = await this.playerService.getAll();
    return this.filterService.filterAndSortList(players, filterOptions);
  }
  async getOnePlayer(id: string): Promise<Player> {
    return this.playerService.getOne(id);
  }

}
