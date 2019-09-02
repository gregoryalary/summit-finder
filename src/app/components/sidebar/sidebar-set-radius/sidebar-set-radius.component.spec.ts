import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarSetRadiusComponent } from './sidebar-set-radius.component';

describe('SidebarSetRadiusComponent', () => {
  let component: SidebarSetRadiusComponent;
  let fixture: ComponentFixture<SidebarSetRadiusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidebarSetRadiusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarSetRadiusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
