import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TerraformResourceComponent } from './terraform-resource.component';

describe('TerraformResourceComponent', () => {
  let component: TerraformResourceComponent;
  let fixture: ComponentFixture<TerraformResourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TerraformResourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TerraformResourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
