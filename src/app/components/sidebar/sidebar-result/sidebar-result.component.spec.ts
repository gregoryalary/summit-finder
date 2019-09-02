import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarResultComponent } from './sidebar-result.component';

describe('SidebarResultComponent', () => {
  let component: SidebarResultComponent;
  let fixture: ComponentFixture<SidebarResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidebarResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
