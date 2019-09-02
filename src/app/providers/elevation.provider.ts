import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {LatLng, LatLngLiteral} from 'leaflet';
import {Observable, of} from 'rxjs';
import {Elevation} from '../models/elevation.model';
import {flatMap, map, take} from 'rxjs/operators';
import {ApplicationStore} from '../store/application.store';

@Injectable()
export class ElevationProvider {

    static countRequestSent: number = 0;

    private API = 'https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/elevation/json';

    constructor(private http: HttpClient, private applicationStore: ApplicationStore) {
    }

    public getElevations(coordinates: LatLngLiteral[]): Observable<Elevation[]> {
        // return this.getFakeElevations(coordinates); // stub
        if (!coordinates || coordinates.length <= 0) {
            return of([]);
        } else {
            const coordinatesToString: string = coordinates.map((coordinate: LatLngLiteral): string => {
                return `${coordinate.lat},${coordinate.lng}`;
            }).join('|');
            return this.applicationStore.apiKey$.pipe(flatMap((key: string): Observable<Elevation[]> => {
                return this.http.get(`${this.API}?locations=${coordinatesToString}&key=${key}`).pipe(
                    take(1),
                    map((result: any): Elevation[] => {
                        return result.results;
                    })
                );
            }));
        }
    }

    private getFakeElevations(coordinates: LatLngLiteral[]) {
        console.warn('Using the fake elevation stub');
        ElevationProvider.countRequestSent += coordinates.length;
        console.log(`Would have sent ${ElevationProvider.countRequestSent} requests`);
        return of(coordinates.map((coordinate: LatLngLiteral): Elevation => ({
            elevation: Math.floor(Math.random() * 2999),
            location: {
                lat: coordinate.lat,
                lng: coordinate.lng
            }
        })));
    }
}
