import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarButtonsPrevNextComponent } from './sidebar-buttons-prev-next.component';

describe('SidebarButtonsPrevNextComponent', () => {
  let component: SidebarButtonsPrevNextComponent;
  let fixture: ComponentFixture<SidebarButtonsPrevNextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidebarButtonsPrevNextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarButtonsPrevNextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
