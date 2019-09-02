import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
    selector: 'app-sidebar-buttons-prev-next',
    templateUrl: './sidebar-buttons-prev-next.component.html',
    styleUrls: ['./sidebar-buttons-prev-next.component.scss']
})
export class SidebarButtonsPrevNextComponent {

    @Input() public loading: boolean = false;

    @Output() public next: EventEmitter<void> = new EventEmitter<void>();
    @Output() public previous: EventEmitter<void> = new EventEmitter<void>();

    constructor() {
    }

    emitNext() {
        this.next.emit();
    }

    emitPrevious() {
        this.previous.emit();
    }
}
