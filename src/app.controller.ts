import { Controller, DefaultValuePipe, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { FilterOptions } from './filter/filter-options';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get("player")
  getAll(@Query("key", new DefaultValuePipe('points_per_price')) key: string,
    @Query("min_value") min_value: string,
    @Query("max_value") max_value: string,
    @Query("sort_dir", new DefaultValuePipe('dsc')) sort_dir: string) {
    let filterOptions: FilterOptions = {
      key: key,
      min_value: min_value,
      max_value: max_value,
      sort_dir: sort_dir
    };
    return this.appService.getAllPlayers(filterOptions);
  }
}
