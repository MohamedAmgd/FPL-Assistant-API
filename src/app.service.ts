import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import * as cheerio from 'cheerio';

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

  async getPlayerCostChangePrediction(filter_options: any): Promise<any> {
    let secrectParam = await this.getSecretParam();
    const headersRequest = {
      'Referer': 'http://www.fplstatistics.co.uk/Home/IndexAndroid2',
      'X-Requested-With': 'XMLHttpRequest'
    };
    const result = await firstValueFrom(this.httpService
      .get(`http://www.fplstatistics.co.uk/Home/AjaxPricesIHandler?${secrectParam.paramName}=${secrectParam.paramValue}&pyseltype=0&_=${Date.now()}`
        , { headers: headersRequest }));
    let players: any[] = [];
    result.data.aaData.map(e => {
      return {
        first_name: '',
        second_name: e[1],
        team: e[2],
        position: e[3],
        now_cost: e[6] * 10,
        delta: e[10],
        target: e[11],
        fixtures: e[16]
      }
    }).filter(e => !this.shouldBeFilltered(e, filter_options))
      .forEach(element => {
        players.push({
          name: element.first_name + " " + element.second_name,
          team: element.team,
          position: element.position,
          cost: element.now_cost / 10,
          delta: element.delta,
          target: element.target,
          fixtures: element.fixtures
        });
      })
    players.sort((a, b) => {
      return b.target - a.target;
    });
    return players;
  }
  async getSecretParam() {
    const homeHtml = await firstValueFrom(this.httpService
      .get(`http://www.fplstatistics.co.uk/`));
    const $ = cheerio.load(homeHtml.data);
    let params = [];
    $('script', homeHtml.data).each((i, e) => {
      if (e.attribs.type === "text/javascript") {
        let decodedScript = $(e.children).text();
        let startIndexOfParamName = decodedScript.indexOf('\"\\x6E\\x61\\x6D\\x65\":\"') + '\"\\x6E\\x61\\x6D\\x65\":\"'.length;
        let endIndexOfParamName = decodedScript.indexOf('\",\"', startIndexOfParamName);
        let startIndexOfParamValue = decodedScript.indexOf('"\\x76\\x61\\x6C\\x75\\x65":') + '"\\x76\\x61\\x6C\\x75\\x65":'.length;
        let endIndexOfParamValue = decodedScript.indexOf("});", startIndexOfParamValue);
        let paramName = decodedScript.substring(startIndexOfParamName, endIndexOfParamName);
        let paramValue = decodedScript.substring(startIndexOfParamValue, endIndexOfParamValue);
        params.push({
          paramName: paramName,
          paramValue: paramValue
        });
      }
    });
    return params[0];
  }
  shouldBeFilltered(element: any, filter_options: Map<string, any>): boolean {
    let cost = element.now_cost / 10;
    return cost >= filter_options.get("max_price") || cost <= filter_options.get("min_price");
  }
}
