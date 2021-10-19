import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get("points_per_pound")
  getPlayerPointsPerPound(@Query("min_price") min_price: number,
    @Query("max_price") max_price: number) {

    let filter_options = new Map();
    if (min_price) {
      filter_options.set("min_price", min_price);
    }
    if (max_price) {
      filter_options.set("max_price", max_price);
    }
    return this.appService.getPlayerPointsPerPound(filter_options);
  }
}
