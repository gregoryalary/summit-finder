import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarPrecisionSettingsComponent } from './sidebar-precision-settings.component';

describe('SidebarPrecisionSettingsComponent', () => {
  let component: SidebarPrecisionSettingsComponent;
  let fixture: ComponentFixture<SidebarPrecisionSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidebarPrecisionSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarPrecisionSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
