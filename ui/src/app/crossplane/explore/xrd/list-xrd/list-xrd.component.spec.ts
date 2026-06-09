import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListXrdComponent } from './list-xrd.component';

describe('ListXrdComponent', () => {
  let component: ListXrdComponent;
  let fixture: ComponentFixture<ListXrdComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListXrdComponent],
    });
    fixture = TestBed.createComponent(ListXrdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
