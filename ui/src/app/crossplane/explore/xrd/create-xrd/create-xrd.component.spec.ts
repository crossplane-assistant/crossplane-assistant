import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateXrdComponent } from './create-xrd.component';

describe('CreateXrdComponent', () => {
  let component: CreateXrdComponent;
  let fixture: ComponentFixture<CreateXrdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateXrdComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateXrdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
