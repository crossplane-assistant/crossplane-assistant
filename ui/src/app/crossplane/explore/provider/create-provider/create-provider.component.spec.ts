import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateProviderComponent } from './create-provider.component';

describe('CreateProviderComponent', () => {
  let component: CreateProviderComponent;
  let fixture: ComponentFixture<CreateProviderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateProviderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateProviderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
