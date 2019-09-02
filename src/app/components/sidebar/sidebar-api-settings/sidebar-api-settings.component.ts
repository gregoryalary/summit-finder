import {Component, OnDestroy, OnInit} from '@angular/core';
import {ApplicationStore} from '../../../store/application.store';
import {FormControl, Validators} from '@angular/forms';
import {Observable, Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import {ApplicationState} from '../../../models/application-state.model';

@Component({
    selector: 'app-sidebar-api-settings',
    templateUrl: './sidebar-api-settings.component.html',
    styleUrls: ['./sidebar-api-settings.component.scss']
})
export class SidebarApiSettingsComponent implements OnInit, OnDestroy {

    private apiKeyInput: FormControl;

    private destroy: Subject<boolean> = new Subject();
    private destroy$: Observable<boolean> = this.destroy.asObservable();

    constructor(private applicationStore: ApplicationStore) {

    }

    ngOnInit() {
        this.initApiKey();
        this.disableInputWhenSearching();
    }

    private initApiKey() {
        this.apiKeyInput = new FormControl('', [
            Validators.required
        ]);
        this.applicationStore.apiKey$.pipe(takeUntil(this.destroy$)).subscribe((apiKey: string): void => {
            if (this.apiKeyInput.value !== apiKey) {
                this.apiKeyInput.setValue(apiKey, {
                    emitEvent: false
                });
            }
        });
    }

    next(): void {
        this.apiKeyInput.markAsDirty();
        if (this.apiKeyInput.valid) {
            this.applicationStore.setApiKey(this.apiKeyInput.value);
            this.applicationStore.setApplicationState('SEARCHING');
        }
    }

    ngOnDestroy(): void {
        this.destroy.next(true);
        this.destroy.complete();
    }

    private disableInputWhenSearching() {
        this.applicationStore.state$.pipe(takeUntil(this.destroy$), filter((state: ApplicationState): boolean => state === 'SEARCHING')).subscribe((): void => {
            this.apiKeyInput.disable();
        });
        this.applicationStore.state$.pipe(takeUntil(this.destroy$), filter((state: ApplicationState): boolean => state !== 'SEARCHING')).subscribe((): void => {
            this.apiKeyInput.enable();
        });
    }

    previous() {
        this.applicationStore.setApplicationState('SET_PRECISION');
    }
}
