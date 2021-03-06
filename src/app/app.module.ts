import { OrderEffects } from './ngrx/effect/order-effect';
import { RouterModule } from '@angular/router';
import { CallbackComponent } from './callback/callback.component';
import { AuthService } from './service/auth.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { appRoutes } from './app-routing.module';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { StoreModule } from '@ngrx/store';
import { OrderReducer } from './ngrx/reducer/order-reducer';
import { EffectsModule } from '@ngrx/effects';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { DatePickerDirective } from './directive/date-picker.directive';
// import { IndexedDBService } from './service/indexeddb.service';
// import { ReactiveFormsModule, FormsModule } from '@angular/forms';
// import { HttpModule } from '@angular/http';

const firebase = {
  apiKey: 'AIzaSyC22dRy8lpaa7QHsfzO_BUWoR4MMVuofd8',
  authDomain: 'ordermeal-76bf4.firebaseapp.com',
  databaseURL: 'https://ordermeal-76bf4.firebaseio.com',
  projectId: 'ordermeal-76bf4',
  storageBucket: 'ordermeal-76bf4.appspot.com',
  messagingSenderId: '826319177185'
};

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    // DatePickerDirective,
    CallbackComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    EffectsModule.runAfterBootstrap(OrderEffects),
    StoreModule.provideStore({ order: OrderReducer }),
    RouterModule.forRoot(appRoutes, { useHash: true }),
    AngularFireModule.initializeApp(firebase),
    AngularFireDatabaseModule,
  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }
