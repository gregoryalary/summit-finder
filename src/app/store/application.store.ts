import {BehaviorSubject, Observable, ReplaySubject} from 'rxjs';
import {ApplicationState} from '../models/application-state.model';
import {Injectable} from '@angular/core';
import {LatLng} from 'leaflet';
import {distinctUntilChanged} from 'rxjs/operators';
import {Precision} from '../models/precision.model';
import {Result} from '../models/result.model';

@Injectable({
    providedIn: 'root'
})
export class ApplicationStore {

    private state: BehaviorSubject<ApplicationState> = new BehaviorSubject('START');
    public readonly state$: Observable<ApplicationState> = this.state.asObservable().pipe(distinctUntilChanged());

    private location: ReplaySubject<LatLng> = new ReplaySubject(1);
    public readonly location$: Observable<LatLng> = this.location.asObservable();

    private searchRadius: BehaviorSubject<number> = new BehaviorSubject(10);
    public readonly searchRadius$: Observable<number> = this.searchRadius.asObservable();

    private result: ReplaySubject<Result[]> = new ReplaySubject(1);
    public readonly result$: Observable<Result[]> = this.result.asObservable();

    private precision: ReplaySubject<Precision> = new ReplaySubject(1);
    public readonly precision$: Observable<Precision> = this.precision.asObservable();

    private apiKey: ReplaySubject<string> = new ReplaySubject(1);
    public readonly apiKey$: Observable<string> = this.apiKey.asObservable();

    private menuIsActive: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    public readonly menuIsActive$: Observable<boolean> = this.menuIsActive.asObservable();

    public setApplicationState(newState: ApplicationState): void {
        this.state.next(newState);
    }

    public setLocation(newLocation: LatLng): void {
        this.location.next(newLocation);
    }

    public setSearchRadius(newSearchRadius: number): void {
        if (newSearchRadius !== this.searchRadius.getValue()) {
            this.searchRadius.next(newSearchRadius);
        }
    }

    public setPrecision(newPrecision: Precision): void {
        this.precision.next(newPrecision);
    }

    public setResult(result: Result[]): void {
        this.result.next(result);
    }

    public setApiKey(newApiKey: string): void {
        this.apiKey.next(newApiKey);
    }

    public setMenuIsActive(menuIsActive: boolean): void {
        this.menuIsActive.next(menuIsActive);
    }

    public toggleMenuIsActive(): void {
        this.setMenuIsActive(!this.menuIsActive.getValue());
    }

}
