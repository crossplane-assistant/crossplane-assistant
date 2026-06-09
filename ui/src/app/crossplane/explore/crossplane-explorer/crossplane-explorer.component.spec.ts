import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrossplaneExplorerComponent } from './crossplane-explorer.component';

describe('CrossplaneExplorerComponent', () => {
  let component: CrossplaneExplorerComponent;
  let fixture: ComponentFixture<CrossplaneExplorerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CrossplaneExplorerComponent],
    });
    fixture = TestBed.createComponent(CrossplaneExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
