import {Component, OnDestroy, OnInit} from '@angular/core';
import {ApplicationStore} from '../../../store/application.store';
import {takeUntil} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';
import {Result} from '../../../models/result.model';

@Component({
    selector: 'app-sidebar-result',
    templateUrl: './sidebar-result.component.html',
    styleUrls: ['./sidebar-result.component.scss']
})
export class SidebarResultComponent implements OnInit, OnDestroy {

    public bestResult: Result;

    private destroy: Subject<boolean> = new Subject();
    private destroy$: Observable<boolean> = this.destroy.asObservable();

    constructor(private applicationStore: ApplicationStore) {
    }

    ngOnInit() {
        this.getBestResult();
    }

    restart() {
        this.applicationStore.setResult([]);
        this.applicationStore.setApplicationState('START');
    }

    private getBestResult() {
        this.applicationStore.result$.pipe(takeUntil(this.destroy$)).subscribe((results: Result[]): void => {
            this.bestResult = results.reduce((max: Result, current: Result): Result => {
                return current.elevation > max.elevation ? current : max;
            }, results[0]);
        });
    }

    ngOnDestroy(): void {
        this.destroy.next(true);
        this.destroy.complete();
    }

}
