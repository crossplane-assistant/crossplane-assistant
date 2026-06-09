import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericResourceComponent } from './generic-resource.component';

describe('GenericResourceComponent', () => {
  let component: GenericResourceComponent;
  let fixture: ComponentFixture<GenericResourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericResourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GenericResourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
