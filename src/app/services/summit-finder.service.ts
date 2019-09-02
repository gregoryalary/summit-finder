import {Injectable} from '@angular/core';
import {LatLngLiteral} from 'leaflet';
import {isPointWithinRadius} from 'geolib';
import {Precision} from '../models/precision.model';
import {Observable, of, zip} from 'rxjs';
import {Elevation} from '../models/elevation.model';
import {catchError, flatMap, map} from 'rxjs/operators';
import {ElevationProvider} from '../providers/elevation.provider';
import {Result} from '../models/result.model';

@Injectable()
export class SummitFinderService {

    constructor(private elevationProvider: ElevationProvider) {
    }

    /** Approximated earth radius in kilometers */
    private static readonly EARTH_RADIUS_KM: number = 6371;

    /**
     * Convert the value of n kilometers (from right to north) to an amount of latitude degrees
     * for a given latitude.
     * A latitude is required because the value of a longitude degrees changes depending depending on its south/north axis position
     * @param km the number of kilometers to convert
     * @param latitude the latitude of the longitude degrees that will be returned
     */
    private static getKmToLongitudeDegreesForALatitude(km: number, latitude: number): number {
        return km * (1 / (111.320 * Math.cos(SummitFinderService.toRadian(latitude))));
    }

    /**
     * Convert the value of n kilometers (from right to north) to an amount of latitude degrees
     * @param km the number of kilometers to convert
     */
    private static getKmToLatitudeDegrees(km: number = 1): number {
        return km * (1 / 110.54);
    }

    /**
     * Return the value of a number in radian
     * @param x the number to convert to radian
     */
    private static toRadian(x: number): number {
        return x * Math.PI / 180;
    }

    /**
     * Return a square represented by 4 coordinates that wraps a circle represented by coordinates (the center) and a radius
     * @param coordinates the center of the circle
     * @param kmRadius the radius of the square in kilometers
     */
    private static getSquareContainingCircle(coordinates: LatLngLiteral, kmRadius: number): EarthSquare {
        return {
            topLeft: {
                lat: coordinates.lat + SummitFinderService.getKmToLatitudeDegrees(kmRadius),
                lng: coordinates.lng - SummitFinderService.getKmToLongitudeDegreesForALatitude(
                    kmRadius,
                    coordinates.lat + SummitFinderService.getKmToLatitudeDegrees(kmRadius)
                )
            },
            topRight: {
                lat: coordinates.lat + SummitFinderService.getKmToLatitudeDegrees(kmRadius),
                lng: coordinates.lng + SummitFinderService.getKmToLongitudeDegreesForALatitude(
                    kmRadius,
                    coordinates.lat + SummitFinderService.getKmToLatitudeDegrees(kmRadius)
                )
            },
            bottomLeft: {
                lat: coordinates.lat - SummitFinderService.getKmToLatitudeDegrees(kmRadius),
                lng: coordinates.lng - SummitFinderService.getKmToLongitudeDegreesForALatitude(
                    kmRadius,
                    coordinates.lat - SummitFinderService.getKmToLatitudeDegrees(kmRadius)
                )
            },
            bottomRight: {
                lat: coordinates.lat - SummitFinderService.getKmToLatitudeDegrees(kmRadius),
                lng: coordinates.lng + SummitFinderService.getKmToLongitudeDegreesForALatitude(
                    kmRadius,
                    coordinates.lat - SummitFinderService.getKmToLatitudeDegrees(kmRadius)
                )
            },
        };
    }

    /**
     * Return a set of n coordinates where :
     *  - n approaches the value of n but is never bigger than it
     *  - all the coordinates are contained in the circle of center coordinates and of radius kmRadius
     *  - the coordinates are somewhat fairly distributed in the circle
     *  The function will firstly fairly distribute the coordinates (in amount of n value) in the smallest square containing the
     *  circle and will then filter all theses coordinates to keep only the value effectively into the circle.
     *  Since we will be far from having "n" coordinates, we can try to add more coordinates to have "n" coordinates after
     *  the filtering
     * @param center the center of the circle in which all the coordinates will be contained
     * @param kmRadius the radius of the circle in which all the coordinates will be contained
     * @param n the number of the coordinates that will be AT MOST returned, the function will try to approach it but will never
     *                  return more coordinates than this value
     */
    getNCoordinatesInCircle(center: LatLngLiteral, kmRadius: number, n: number, originalCenter: LatLngLiteral, originalKmRadius: number): [LatLngLiteral[], number] {
        // We reduce a little bit the radius to be sure that no coordinates will be on the very edge of the circle
        const reducedKmRadius: number = kmRadius * 0.95;
        const squareAngles: EarthSquare = SummitFinderService.getSquareContainingCircle(center, reducedKmRadius);
        let gridItems: LatLngLiteral[] = [];
        let numberOfStepsPerEdge: number = 0;
        // The value used to add more coordinates to the square, hoping that enough coordinates will be then filtered
        let precisionSizeFactor = 0.6; // 0.6 means that we start with 60% more coordinates
        do {
            gridItems = [];
            // The new value of the precision that we will try in this iteration
            const biggerN = n + (precisionSizeFactor >= 0 ? n * precisionSizeFactor : 0);
            // The number of column and row in the virtual grid overlaying the containing square
            // ex: if we need 50 coordinates. We will use 7 columns and 7 grids because (7*7=49)≈50
            numberOfStepsPerEdge = Math.floor(Math.sqrt(biggerN)) - 1;
            // The size of the steps between the columns and the row, reduced a bit to not be on the very edge of the square
            const latStep: number = SummitFinderService.getKmToLatitudeDegrees(reducedKmRadius * 2) / numberOfStepsPerEdge * 0.999;
            const lngStep: number = SummitFinderService.getKmToLongitudeDegreesForALatitude(reducedKmRadius * 2, center.lat) / numberOfStepsPerEdge * 0.999;
            // Add all the coordinates that are on where a row and a column cross and in the circle
            for (let lat = squareAngles.topLeft.lat; lat >= squareAngles.bottomLeft.lat; lat -= latStep) {
                for (let lng = squareAngles.topLeft.lng; lng <= squareAngles.topRight.lng; lng += lngStep) {
                    if (isPointWithinRadius({lat, lng}, center, kmRadius * 1000) && isPointWithinRadius({
                        lat,
                        lng
                    }, originalCenter, originalKmRadius * 1000)) {
                        gridItems.push({lat, lng});
                    }
                }
            }
            precisionSizeFactor -= 0.05;
        } while (gridItems.length > n); // If ever we have a too much coordinates, we retry with a smaller n
        return [gridItems, numberOfStepsPerEdge];
    }

    /**
     * Return an observable streaming an approximated location of the area' summit
     * @param location the center of the search area
     * @param radius the radius of the search area
     * @param precisionsSpecs the precision's values for this run
     * @param originalLocation the location of the global search area, if null will use the value of location
     * @param originalRadius the radius of the global search area, if null will use the value of radius
     */
    public findSummit(location: LatLngLiteral, radius: number, precisionsSpecs: Precision, originalLocation: LatLngLiteral = null, originalRadius: number = null): Observable<Result[]> {
        originalLocation = originalLocation || location;
        originalRadius = originalRadius || radius;
        // A grid of marker that approximately cover all the area
        const grid: [LatLngLiteral[], number] = this.getNCoordinatesInCircle(location, radius, precisionsSpecs.volleySize, originalLocation, originalRadius);
        // We get the elevation of each grid items
        return this.elevationProvider.getElevations(grid[0]).pipe(flatMap((elevations: Elevation[]): Observable<Result[]> => {
            // If the algorithm already computed all the precision rounds, we return all the elevations of the area
            if (precisionsSpecs.rounds <= 1 && elevations) {
                return of(elevations.map((elevation: Elevation): Result => ({
                    ...elevation, metersRadius: radius / grid[1] * 2000 // bigger radius to stay cautious
                })));
            } else if (elevations && elevations.length) {
                // Otherwise, we return highest elevation of all the sub-areas
                // The sub-areas being the area being around the summits of the current area
                const highestElevations: Elevation[] = this.nHighestElevation(elevations, precisionsSpecs.candidates);
                precisionsSpecs = {...precisionsSpecs, rounds: precisionsSpecs.rounds - 1};
                return zip(...highestElevations.map((elevation: Elevation): Observable<Result[]> => {
                    return this.findSummit(elevation.location, radius / grid[1] / 2, precisionsSpecs, originalLocation, originalRadius);
                })).pipe(map((results: Result[][]): Result[] => {
                    return this.nHighestElevation([].concat(...results), 3).map((elevation: Elevation): Result => ({...(elevation as Result)}));
                }));
            } else {
                return of([]);
            }
        }), catchError((error: Error): Observable<Result[]> => {
            return of([]);
        }));
    }

    /**
     * Return the n highest elevation of an elevation array
     * @param elevations the list of elevations
     * @param n the amount of elevation to return
     */
    private nHighestElevation(elevations: Elevation[], n: number): Elevation[] {
        const highestElevations: Elevation[] = [];
        for (let i = 0; i < n && elevations.length > 0; i = i + 1) {
            const highestIndex: number = elevations.reduce((max: number, current: Elevation, index: number, arr: Elevation[]): number => {
                return current.elevation > arr[max].elevation ? index : max;
            }, 0);
            highestElevations.push({...elevations[highestIndex]});
            elevations.splice(highestIndex, 1);
        }
        return highestElevations;
    }

}

/**
 * Represented a square on the planet earth
 */
interface EarthSquare {
    topLeft: LatLngLiteral;
    topRight: LatLngLiteral;
    bottomLeft: LatLngLiteral;
    bottomRight: LatLngLiteral;
}
