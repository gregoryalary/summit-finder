import {Component, OnInit} from '@angular/core';
import {ApplicationStore} from '../../store/application.store';
import {take} from 'rxjs/operators';
import {ApplicationState} from '../../models/application-state.model';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

    constructor(private applicationStore: ApplicationStore) {
    }

    ngOnInit() {
    }

    /**
     * Toggle the menu if the current state of the application permits it
     */
    toggleMenuIsActive() {
        this.applicationStore.state$.pipe(take(1)).subscribe((state: ApplicationState): void => {
            const statesWhereMenuCanBeInactive: ApplicationState[] = ['START', 'END'];
            if (statesWhereMenuCanBeInactive.indexOf(state) >= 0) {
                this.applicationStore.toggleMenuIsActive();
            }
        });
    }
}
