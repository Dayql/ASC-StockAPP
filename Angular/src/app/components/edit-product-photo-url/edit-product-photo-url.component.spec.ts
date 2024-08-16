import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProductPhotoUrlComponent } from './edit-product-photo-url.component';

describe('EditProductPhotoUrlComponent', () => {
  let component: EditProductPhotoUrlComponent;
  let fixture: ComponentFixture<EditProductPhotoUrlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditProductPhotoUrlComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditProductPhotoUrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
