import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get("points_per_pound")
  getPlayerPointsPerPound(@Query("min_price") min_price: number,
    @Query("max_price") max_price: number,
    @Query("sort_dir") sort_dir: string) {

    let filter_options = new Map();
    if (min_price) {
      filter_options.set("min_price", min_price);
    }
    if (max_price) {
      filter_options.set("max_price", max_price);
    }
    if (!sort_dir) {
      sort_dir = 'dsc'
    }
    return this.appService.getPlayerPointsPerPound(filter_options, sort_dir);
  }

  @Get("cost_change")
  getPlayerCostChange(@Query("min_price") min_price: number,
    @Query("max_price") max_price: number,
    @Query("sort_dir") sort_dir: string) {

    let filter_options = new Map();
    if (min_price) {
      filter_options.set("min_price", min_price);
    }
    if (max_price) {
      filter_options.set("max_price", max_price);
    }
    if (!sort_dir) {
      sort_dir = 'dsc'
    }
    return this.appService.getPlayerCostChange(filter_options, sort_dir);
  }

  @Get("cost_change_prediction")
  getPlayerCostChangePrediction(@Query("min_price") min_price: number,
    @Query("max_price") max_price: number,
    @Query("sort_dir") sort_dir: string) {

    let filter_options = new Map();
    if (min_price) {
      filter_options.set("min_price", min_price);
    }
    if (max_price) {
      filter_options.set("max_price", max_price);
    }
    if (!sort_dir) {
      sort_dir = 'dsc'
    }
    return this.appService.getPlayerCostChangePrediction(filter_options, sort_dir);
  }
}
