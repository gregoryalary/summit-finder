import {Component, OnDestroy, OnInit} from '@angular/core';
import {ApplicationStore} from '../../store/application.store';
import {FormControl, Validators} from '@angular/forms';
import {combineLatest, fromEvent, Observable, Subject} from 'rxjs';
import {filter, map, startWith, take, takeUntil} from 'rxjs/operators';
import {ApplicationState} from '../../models/application-state.model';
import {ElevationProvider} from '../../providers/elevation.provider';
import {Elevation} from '../../models/elevation.model';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {

    public applicationState: ApplicationState;
    public menuIsActive: boolean;

    private destroy: Subject<boolean> = new Subject();
    private destroy$: Observable<boolean> = this.destroy.asObservable();

    constructor(public applicationStore: ApplicationStore) {

    }

    ngOnInit() {
        this.getApplicationState();
        this.getMenuIsActive();
    }

    ngOnDestroy(): void {
        this.destroy.next(true);
        this.destroy.complete();
    }

    private getApplicationState() {
        this.applicationStore.state$.pipe(takeUntil(this.destroy$)).subscribe((state: ApplicationState): void => {
            this.applicationState = state;
        });
    }

    private getMenuIsActive() {
        combineLatest(
            fromEvent(window, 'resize').pipe(startWith(null), map((): number => window.innerWidth)),
            this.applicationStore.state$,
            this.applicationStore.menuIsActive$
        ).pipe(takeUntil(this.destroy$)).subscribe(([windowWidth, state, menuIsActive]: [number, ApplicationState, boolean]): void => {
            const statesWhereMenuCanBeInactive: ApplicationState[] = ['START', 'END'];
            this.menuIsActive = menuIsActive || statesWhereMenuCanBeInactive.indexOf(state) === -1 || windowWidth >= 1024;
        });
    }

}
