import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) { }
  getHello(): string {
    return 'Hello World!';
  }

  async getPlayerPointsPerPound(filter_options: any): Promise<any> {
    const result = await firstValueFrom(this.httpService
      .get('https://fantasy.premierleague.com/api/bootstrap-static/'));
    let players: any[] = [];
    result.data.elements.filter(e => !this.shouldBeFilltered(e, filter_options))
      .forEach(element => {
        let cost = element.now_cost / 10;
        let points_per_pound = element.total_points / cost;
        if (!points_per_pound) {
          points_per_pound = 0;
        }
        players.push({
          id: element.id,
          name: element.first_name + " " + element.second_name,
          points_per_pound: points_per_pound,
          total_points: element.total_points,
          minutes: element.minutes,
          cost: cost
        });
      })
    players.sort((a, b) => b.points_per_pound - a.points_per_pound);
    return players;
  }

  async getPlayerCostChange(filter_options: any): Promise<any> {
    const result = await firstValueFrom(this.httpService
      .get('https://fantasy.premierleague.com/api/bootstrap-static/'));
    let players: any[] = [];
    result.data.elements.filter(e => !this.shouldBeFilltered(e, filter_options))
      .forEach(element => {
        players.push({
          id: element.id,
          name: element.first_name + " " + element.second_name,
          cost_change_event: element.cost_change_event / 10,
          cost_change_start: element.cost_change_start / 10,
          total_points: element.total_points,
          minutes: element.minutes,
          cost: element.now_cost / 10
        });
      })
    players.sort((a, b) => {
      if (b.cost_change_event === a.cost_change_event) {
        return b.cost_change_start - a.cost_change_start;
      }
      return b.cost_change_event - a.cost_change_event;
    });
    return players;
  }
  shouldBeFilltered(element: any, filter_options: Map<string, any>): boolean {
    let cost = element.now_cost / 10;
    return cost >= filter_options.get("max_price") || cost <= filter_options.get("min_price");
  }
}
