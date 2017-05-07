import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

@Component({
  selector: 'app-list-firebase',
  templateUrl: './list-firebase.component.html',
  styleUrls: ['./list-firebase.component.css']
})
export class ListFirebaseComponent implements OnInit {
  arr: any = [];
  people: any[] = [];
  dates: Date[] = [];
  infodata: any;
  caldata: any;

  items: FirebaseListObservable<any>;
  constructor(db: AngularFireDatabase) {
    this.items = db.list('/items');
  }

  ngOnInit() {
    this.items.subscribe((x) => {
      this.arr = x;
      this.Init();
    });
  }
  Init() {
    const arr = this.arr as any[];
    this.people = arr.map(x => x.man)
      .filter((v, i, a) => a.indexOf(v) === i);
    this.getDates();
  }

  /* 臨時查詢撰寫查詢的時間範圍 */
  getDates(): void {
    this.dates = [];
    for (let index = 0; index < 20; index++) {
      const dat = new Date('2017-1-1');
      dat.setDate(dat.getDate() + index);
      const week = dat.getDay();
      if (week === 0 || week === 6) { continue; }
      this.dates.push(dat);
    }
  }

  /*  取得表格目前現金  */
  filterData(dat: Date, name): any {
    const arr = this.arr as any[];
    const item = arr.find(x => x.man === name && x.dateAt === dat.toLocaleDateString());

    if (item != null) {
      const money = item.bcash + item.topUp - item.pay;
      return { 'M': '$:' + money };
    }
    return undefined;
  }

  /*  取得單筆帳單  */
  getInfo(dat, name): any {
    const arr = this.arr as any[];
    this.caldata = arr.filter(x => x.man === name && new Date(x.dateAt) <= dat);

    // 取得查詢範圍內的第一筆資料，保留第一筆先前金額
    const minDateItem = this.caldata.reduce((x, y) =>
      new Date(x.dateAt) < new Date(y.dateAt) ? x : y);

    // 當前資料
    this.infodata = this.caldata.find(x => x.dateAt === dat.toLocaleDateString());

    // 查詢範圍內資料(不含當前資料)
    this.caldata = this.caldata.filter(x => new Date(x.dateAt) < dat);
    console.group();
    console.log('查詢範圍第一筆之前剩餘金額:' + minDateItem.bcash);

    if (this.caldata.length > 0) {
      const topUps = this.caldata.map(x => x.topUp).reduce((x, y) => x + y);
      const pay = this.caldata.map(x => x.pay).reduce((x, y) => x + y);
      this.infodata.bcash = minDateItem.bcash + topUps - pay;
      console.log('查詢範圍儲值總合(不含今日):' + topUps);
      console.log('查詢範圍消費總合(不含今日):' + pay);
    } else {
      this.infodata.bcash = minDateItem.bcash;
    }
    console.groupEnd();
  }

}
