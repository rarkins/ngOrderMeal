import { Store } from '@ngrx/store';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


@Component({
  selector: 'app-check-manage',
  templateUrl: './check-manage.component.html',
  styleUrls: ['./check-manage.component.css']
})
export class CheckManageComponent implements OnInit, OnDestroy {
  form: FormGroup;
  items: FirebaseListObservable<any>;
  queryObj: UserData;
  manArr: UserData[];
  key: any = null;
  isNew = false;

  constructor(private _fb: FormBuilder,
    private db: AngularFireDatabase,
    private route: ActivatedRoute,
    private store: Store<any>,
    private router: Router) {
    this.form = this._fb.group({
      bcash: 0,
      topUp: 0,
      pay: 0,
      store: '',
      man: '',
      dateAt: ['', [Validators.required]],
      content: ''
    });
  }

  ngOnInit() {
    const param = (this.route.queryParams as BehaviorSubject<any>).value;

    if (!param.man) {
      this.isNew = true;
      return;
    }

    if (param && Object.keys(param).length > 0) {
      this.store.dispatch({
        type: 'GETDATA', payload: { man: param.man }
      });
      const unsub = this.store.select(state => state.order).subscribe(x => {
        // tslint:disable-next-line:curly
        if (!x.manArr) return;
        this.manArr = x.manArr;
        if (param.key) {
          this.key = param.key;
          this.queryObj = R.find(z => z.$key === this.key)(x.manArr);
          this.form.patchValue(this.queryObj);
        } else {
          this.queryObj = <UserData>{ man: param.man, topUp: 0, pay: 0 };
          this.form.patchValue({ man: param.man });
        }
        this.SetBcash();
        if (unsub) {
          unsub.unsubscribe();
        }
      });
    }
  }

  check() {
    const new_data: UserData = this.form.value;
    const old_data = <UserData>this.queryObj;
    const GetDate = R.compose(Date.parse, R.prop('dateAt'));
    const Condition = R.converge(R.gt)([GetDate, R.always(GetDate(new_data))]);
    // tslint:disable-next-line:prefer-const 強迫更新時修改之後資料, 因此不能用 const
    let after_datas = R.filter(Condition)(this.manArr);
    const diff_value = (new_data.topUp - new_data.pay) - (old_data.topUp - old_data.pay);
    const items = this.db.list('/items');
    // 修改金額之後的金額的修改
    if (diff_value !== 0) {
      const updateData1 = (a: UserData, b) => {
        b.bcash = a.bcash + a.topUp - a.pay;
        items.update(`${b.$key}`, { bcash: b.bcash });
        return b;
      };
      R.reduce(updateData1, new_data)(after_datas);
    }
    // 當前資料新增與修改
    if (this.isInsert) {
      items.push(new_data);
    } else {
      items.update(`${this.key}`, new_data);
    }
    this.router.navigate(['/list-firebase']);
  }

  getDate($event: any) {
    if ($event) {
      this.form.patchValue({ dateAt: $event.toLocaleDateString() });
    }
    this.SetBcash();
  }

  SetBcash() {
    // tslint:disable-next-line:curly
    if (!this.manArr) return;
    const GetDate = R.compose(Date.parse, R.prop('dateAt'));
    const Condition = R.converge(R.lt, [GetDate, R.always(Date.parse(this.form.value.dateAt))]);
    const item = R.find(Condition)(R.reverse(this.manArr));
    if (item) {
      this.form.patchValue({ bcash: item.bcash + item.topUp - item.pay });
    } else {
      this.form.patchValue({ bcash: 0 });
    }
  }

  ManCheck() {
    // tslint:disable-next-line:no-unused-expression
    new PNotify({
      title: '增加成員測試中',
      text: '目前無作用'
    });
    // swal('目前無作用');
  }

  public get isInsert(): boolean {
    return this.key === null;
  }

  public get isDateExist(): boolean {
    // tslint:disable-next-line:curly
    if (!this.manArr) return false;
    const arr = this.isInsert ? this.manArr : this.manArr.filter((x: any) => x.$key !== this.key);
    return R.contains(this.form.value.dateAt)(R.map(x => x.dateAt)(arr));
  }

  public get isManExist(): boolean {
    // tslint:disable-next-line:curly
    if (!this.manArr) return false;
    const arr = this.isInsert ? this.manArr : this.manArr.filter((x: any) => x.$key !== this.key);
    return R.contains(this.form.value.dateAt)(R.map(x => x.dateAt)(arr));
  }

  ngOnDestroy(): void {
  }

}
