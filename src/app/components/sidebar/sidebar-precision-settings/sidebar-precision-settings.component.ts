import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {Precision} from '../../../models/precision.model';
import {ApplicationStore} from '../../../store/application.store';
import {PrecisionService} from '../../../services/precision.service';
import {Observable, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-sidebar-precision-settings',
  templateUrl: './sidebar-precision-settings.component.html',
  styleUrls: ['./sidebar-precision-settings.component.scss']
})
export class SidebarPrecisionSettingsComponent implements OnInit, OnDestroy {

    precisionInput: FormControl;
    currentPrecision: Precision;

    private destroy: Subject<boolean> = new Subject();
    private destroy$: Observable<boolean> = this.destroy.asObservable();

    constructor(private applicationStore: ApplicationStore, private precisionService: PrecisionService) {

    }

    ngOnInit() {
        this.getPrecision();
        this.initPrecisionInput();
    }

    next() {
        if (this.precisionInput.valid) {
            this.applicationStore.setPrecision(this.currentPrecision);
            this.applicationStore.setApplicationState('SET_API_KEY');
        }
    }

    private initPrecisionInput() {
        this.precisionInput = new FormControl(3, [
            Validators.max(5),
            Validators.min(1),
            Validators.required
        ]);
        this.precisionInput.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((precisionDegree: number): void => {
            this.applicationStore.setPrecision(
                this.precisionService.getPrecisionSpecsForPrecisionDegree(precisionDegree)
            );
        });
        this.precisionInput.setValue(3, {
            emitEvent: true
        });
    }

    private getPrecision() {
        this.applicationStore.precision$.pipe(takeUntil(this.destroy$)).subscribe((precision: Precision): void => {
            this.currentPrecision = precision;
        });
    }

    ngOnDestroy(): void {
        this.destroy.next(true);
        this.destroy.complete();
    }

    previous() {
        this.applicationStore.setApplicationState('LOCATION_READY');
    }
}
