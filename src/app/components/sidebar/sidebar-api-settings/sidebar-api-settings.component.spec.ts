import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarApiSettingsComponent } from './sidebar-api-settings.component';

describe('SidebarApiSettingsComponent', () => {
  let component: SidebarApiSettingsComponent;
  let fixture: ComponentFixture<SidebarApiSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidebarApiSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarApiSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
