import {Component, OnDestroy, OnInit} from '@angular/core';
import {ApplicationStore} from '../../../store/application.store';
import {FormControl, Validators} from '@angular/forms';
import {combineLatest, Observable, Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import {ApplicationState} from '../../../models/application-state.model';

@Component({
    selector: 'app-sidebar-set-radius',
    templateUrl: './sidebar-set-radius.component.html',
    styleUrls: ['./sidebar-set-radius.component.scss']
})
export class SidebarSetRadiusComponent implements OnInit, OnDestroy {

    public radiusInput: FormControl;

    private destroy: Subject<boolean> = new Subject();
    private destroy$: Observable<boolean> = this.destroy.asObservable();

    constructor(private applicationStore: ApplicationStore) {
    }

    ngOnInit() {
        this.initRadiusInput();
    }

    private initRadiusInput() {
        this.radiusInput = new FormControl(0, [
            Validators.required,
            Validators.pattern(/^[0-9]*$/),
            Validators.min(1),
            Validators.max(100)
        ]);

        combineLatest(this.applicationStore.state$, this.radiusInput.valueChanges).pipe(
            takeUntil(this.destroy$),
            filter(([state]: [ApplicationState, any]): boolean => state === 'LOCATION_READY' && this.radiusInput.valid)
        ).subscribe(([, inputRadiusValue]: [ApplicationState, any]): void => {
            if (this.radiusInput.valid) {
                this.applicationStore.setSearchRadius(inputRadiusValue);
            }
        });

        combineLatest(this.applicationStore.state$, this.applicationStore.searchRadius$).pipe(
            takeUntil(this.destroy$),
            filter(([state]: [ApplicationState, number]): boolean => state === 'LOCATION_READY')
        ).subscribe(([, searchRadius]: [ApplicationState, number]): void => {
            if (searchRadius && searchRadius !== this.radiusInput.value) {
                this.radiusInput.setValue(searchRadius);
            }
        });
    }

    next() {
        if (this.radiusInput.valid) {
            this.applicationStore.setApplicationState('SET_PRECISION');
        }
    }

    previous() {
        this.applicationStore.setApplicationState('START');
    }

    ngOnDestroy(): void {
        this.destroy.next(true);
        this.destroy.complete();
    }

}
