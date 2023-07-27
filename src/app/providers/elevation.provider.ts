import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {LatLngLiteral} from 'leaflet';
import {Observable, from, of} from 'rxjs';
import {Elevation} from '../models/elevation.model';
import {flatMap, map, take} from 'rxjs/operators';
import {ApplicationStore} from '../store/application.store';
import { Loader } from '@googlemaps/js-api-loader';

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
            return this.applicationStore.apiKey$.pipe(flatMap((key: string): Observable<Elevation[]> => {
                const googleApiLoader = new Loader({
                    apiKey: key,
                    version: "weekly",
                    libraries: ["elevation"]
                });

                return from(googleApiLoader.importLibrary('elevation')).pipe(flatMap(google => {
                    const elevationApi = new google.ElevationService();
                    return new Observable<Elevation[]>(observer => {
                        elevationApi.getElevationForLocations({locations: coordinates}, (response) => {
                            observer.next(response.map(elevation => ({
                                elevation: elevation.elevation,
                                location: {
                                    lat: elevation.location.lat(),
                                    lng: elevation.location.lng()
                                }
                            })));
                        });
                    });
                }));
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
