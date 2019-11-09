import { Component, OnDestroy, OnInit } from '@angular/core';
import { circle, LatLng, latLng, Layer, LeafletMouseEvent, MapOptions, marker, tileLayer, icon } from 'leaflet';
import { ApplicationStore } from '../../store/application.store';
import { combineLatest, Observable, Subject, zip } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';
import { ApplicationState } from '../../models/application-state.model';
import { SummitFinderService } from '../../services/summit-finder.service';
import { Precision } from '../../models/precision.model';
import { Result } from '../../models/result.model';

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
    providers: [SummitFinderService]
})
export class MapComponent implements OnInit, OnDestroy {

    public displayErrorModal = false;

    public options: MapOptions = {};
    public searchRadius: Layer = null;
    public resultMarkers: Layer[] = [];
    public resultAreaMarkers: Layer[] = [];
    public gridMarkers: Layer[] = [];

    private destroy: Subject<boolean> = new Subject();
    private destroy$: Observable<boolean> = this.destroy.asObservable();

    constructor(public applicationStore: ApplicationStore, private summitFinderService: SummitFinderService) {

    }

    ngOnInit() {
        this.initMapOptions();
        this.keepResultMarkerUpToDate();
        this.startSearchingSummit();
        this.keepRadiusCircleUpToDate();
    }

    private initMapOptions() {
        this.options = {
            layers: [
                tileLayer(
                    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    {
                        maxZoom: 18,
                        attribution: '...'
                    }
                )
            ],
            zoom: 10,
            center: latLng(43.11, 12.64)
        };
    }

    onClick($event: LeafletMouseEvent) {
        this.applicationStore.state$.pipe(take(1)).subscribe((state: ApplicationState): void => {
            if (state === 'START' || state === 'LOCATION_READY') {
                this.applicationStore.setLocation($event.latlng);
                this.applicationStore.setApplicationState('LOCATION_READY');
            }
        });
    }

    private keepResultMarkerUpToDate() {
        combineLatest(
            this.applicationStore.state$,
            this.applicationStore.result$,
        ).pipe(takeUntil(this.destroy$)).subscribe(([state, results]: [ApplicationState, Result[]]): void => {
            if (state === 'END') {
                this.resultMarkers = results.map((result: Result): Layer => {
                    const resultMarker: Layer = marker(result.location, {
                        icon: icon({
                            iconSize: [25, 41],
                            iconAnchor: [13, 41],
                            iconUrl: 'leaflet/marker-icon.png',
                            shadowUrl: 'leaflet/marker-shadow.png'
                        })
                    });
                    resultMarker.bindPopup(`${result.elevation} meters`).openPopup();
                    return resultMarker;
                });
                this.resultAreaMarkers = results.map((result: Result): Layer => circle(result.location, {
                    radius: result.metersRadius,
                    color: 'red'
                }));
            } else {
                this.resultMarkers = [];
                this.resultAreaMarkers = [];
            }
        });
    }

    private keepRadiusCircleUpToDate() {
        combineLatest(
            this.applicationStore.state$,
            this.applicationStore.location$,
            this.applicationStore.searchRadius$
        ).pipe(takeUntil(this.destroy$)).subscribe(([state, location, radius]: [ApplicationState, LatLng, number]): void => {
            if (['LOCATION_READY', 'SEARCHING', 'SET_PRECISION', 'SET_API_KEY', 'END'].indexOf(state) > -1 && location && radius > 0) {
                this.searchRadius = circle(location, { radius: radius * 1000 });
            } else {
                this.searchRadius = null;
            }
        });
    }

    private startSearchingSummit(): void {
        this.applicationStore.state$.pipe(
            takeUntil(this.destroy$),
            filter((state: ApplicationState): boolean => state === 'SEARCHING')
        ).subscribe((): void => {
            zip(
                this.applicationStore.location$.pipe(take(1)),
                this.applicationStore.searchRadius$.pipe(take(1)),
                this.applicationStore.precision$.pipe(take(1))
            ).pipe(take(1)).subscribe(([location, radius, precisionSpecs]: [LatLng, number, Precision]): void => {
                this.summitFinderService.findSummit(location, radius, precisionSpecs).subscribe((results: Result[]): void => {
                    if (results && results.length) {
                        this.applicationStore.setResult(results);
                        this.applicationStore.setApplicationState('END');
                    } else {
                        this.displayErrorModal = true;
                    }
                });
            });
        });

    }

    ngOnDestroy(): void {
        this.destroy.next(true);
        this.destroy.complete();
    }

    closeErrorModal() {
        this.displayErrorModal = false;
        this.applicationStore.setResult([]);
        this.applicationStore.setApplicationState('SET_API_KEY');
    }
}
