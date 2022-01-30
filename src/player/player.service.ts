import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as cheerio from 'cheerio';
import { Player } from './entities/player.entity';

@Injectable()
export class PlayerService {
    constructor(private readonly httpService: HttpService) { }

    getPlayerPositionString(position: number) {
        const positions = ["", "Goalkeeper", "Defender", "Midfielder", "Forward"];
        return positions[position]
    }
    findPlayerInFplStatisticsList(playerData: any, list: any[]): any[] {
        let player: any;
        list.forEach((element: string[]) => {
            let ownership_1: number = Number.parseFloat(element[5]);
            let ownership_2: number = Number.parseFloat(playerData.selected_by_percent);
            if (element[1] === playerData.web_name
                && ownership_1 === ownership_2
                && element[3].toUpperCase() === this.getPlayerPositionString(playerData.element_type).charAt(0)
                && element[6] === (playerData.now_cost / 10).toString()) {
                player = element;
                return;
            }
        });
        return player;
    }
    async getFplBootstrap(): Promise<any> {
        const result = await firstValueFrom(this.httpService
            .get('https://fantasy.premierleague.com/api/bootstrap-static/'));
        return result.data;
    }

    async getFplBootstrapPlayers(): Promise<any> {
        const result = await this.getFplBootstrap();
        return result.elements;
    }

    async getFplStatisticsPlayers(): Promise<any> {
        let secrectParam = await this.getSecretParam();
        const headersRequest = {
            'Referer': 'http://www.fplstatistics.co.uk/Home/IndexAndroid2',
            'X-Requested-With': 'XMLHttpRequest'
        };
        const result = await firstValueFrom(this.httpService
            .get(`http://www.fplstatistics.co.uk/Home/AjaxPricesIHandler?${secrectParam.paramName}=${secrectParam.paramValue}&pyseltype=0&_=${Date.now()}`
                , { headers: headersRequest }));
        return result.data.aaData;
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
                let paramName = encodeURIComponent(decodedScript.substring(startIndexOfParamName, endIndexOfParamName));
                let paramValue = decodedScript.substring(startIndexOfParamValue, endIndexOfParamValue);
                params.push({
                    paramName: paramName,
                    paramValue: paramValue
                });
            }
        });
        return params[0];
    }

    async getAll(): Promise<Player[]> {
        let players: Player[] = [];
        const fplPlayers = await this.getFplBootstrapPlayers();
        const fplStatisticsPlayers = await this.getFplStatisticsPlayers();
        fplPlayers.forEach(element => {
            const fplStatisticsPlayer = this.findPlayerInFplStatisticsList(element, fplStatisticsPlayers) || [];
            const playerPrice = element.now_cost / 10;
            const playerPointsPerPrice = Number.parseFloat((element.total_points / playerPrice).toFixed(2));
            let player: Player = {
                id: element.id,
                first_name: element.first_name,
                second_name: element.second_name,
                team: fplStatisticsPlayer[2],
                position: this.getPlayerPositionString(element.element_type),
                status: element.status,
                owned_by: Number.parseFloat(element.selected_by_percent),
                price: playerPrice,
                cost_change_event: element.cost_change_event / 10,
                cost_change_prediction: Number.parseFloat(fplStatisticsPlayer[11]),
                fixtures: fplStatisticsPlayer[16],
                img_url: `https://resources.premierleague.com/premierleague/photos/players/110x140/p${element.code}.png`,
                dreamteam_count: element.dreamteam_count,
                in_dreamteam: element.in_dreamteam,
                form: Number.parseFloat(element.form),
                chance_of_playing_this_round: element.chance_of_playing_this_round,
                chance_of_playing_next_round: element.chance_of_playing_next_round,
                news: element.news,
                season_bonus_points: element.season_bonus_points,
                total_points: element.total_points,
                points_per_price: playerPointsPerPrice
            }
            players.push(player);
        });
        return players;
    }

    async getOne(id: string): Promise<Player> {
        let players = await this.getAll();
        let result: Player;
        players.forEach(player => {
            if (player.id == id) {
                result = player;
                return;
            }
        });
        return result;
    }
}
