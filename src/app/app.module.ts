import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {SidebarComponent} from './components/sidebar/sidebar.component';
import {LeafletModule} from '@asymmetrik/ngx-leaflet';
import { MapComponent } from './components/map/map.component';
import {ApplicationStore} from './store/application.store';
import {ReactiveFormsModule} from '@angular/forms';
import {ElevationProvider} from './providers/elevation.provider';
import {HttpClientModule} from '@angular/common/http';
import { SidebarSetRadiusComponent } from './components/sidebar/sidebar-set-radius/sidebar-set-radius.component';
import { SidebarApiSettingsComponent } from './components/sidebar/sidebar-api-settings/sidebar-api-settings.component';
import { SidebarResultComponent } from './components/sidebar/sidebar-result/sidebar-result.component';
import {PrecisionService} from './services/precision.service';
import { SidebarPrecisionSettingsComponent } from './components/sidebar/sidebar-precision-settings/sidebar-precision-settings.component';
import { SidebarButtonsPrevNextComponent } from './components/sidebar/sidebar-buttons-prev-next/sidebar-buttons-prev-next.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';

@NgModule({
    declarations: [
        AppComponent,
        SidebarComponent,
        MapComponent,
        SidebarSetRadiusComponent,
        SidebarApiSettingsComponent,
        SidebarResultComponent,
        SidebarPrecisionSettingsComponent,
        SidebarPrecisionSettingsComponent,
        SidebarButtonsPrevNextComponent,
        NavbarComponent,
        FooterComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        LeafletModule.forRoot(),
        ReactiveFormsModule
    ],
    providers: [
        ApplicationStore,
        ElevationProvider,
        PrecisionService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
