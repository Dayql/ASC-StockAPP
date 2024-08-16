import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProductLocalisationComponent } from './edit-product-localisation.component';

describe('EditProductLocalisationComponent', () => {
  let component: EditProductLocalisationComponent;
  let fixture: ComponentFixture<EditProductLocalisationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditProductLocalisationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditProductLocalisationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
