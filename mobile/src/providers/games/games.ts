import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { ENV } from '@app/env';
import { TokenProvider } from '../token/token';
import { IGame } from '../../pages/game/game.interfaces';
import { GameModel } from '../../models/game-model';

@Injectable()
export class GamesProvider {

  private readonly endpoint: string;
  private data: Array<any>=[];
  private page: number=1

  public constructor(public http: Http, public tokenProvider: TokenProvider) {
    this.endpoint = `${ENV.API_URL}/games.json`;
  }

  public async save(params: IGame): Promise<{}> {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.endpoint}`, { 'games' : params }, this.tokenProvider.requestOptions())
        .subscribe(data => {
          resolve(data);
        }, err => reject(err));
    });
  }

  resetList() {
    this.data = []
    this.page = 1
  }

  loadMore(infiniteScroll?) {
    this.page += 1;
    return this.loadList(infiniteScroll);
  }

  loadList(infiniteScroll?) {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.endpoint}?page=${this.page}`, this.tokenProvider.requestOptions())
        .map(res => res.json())
        .subscribe(data => {
          for (let row of data) {
            this.data.push(
              new GameModel(row.id, row.red_score, row.blue_score, row.created_at, row.players)
            )
          }
          if (infiniteScroll) {
            infiniteScroll.complete()
          }
          if (data.length == 0) {
            infiniteScroll.enable(false)
          }

          resolve(data);
        }, err => reject(err));
    });
  }
}
