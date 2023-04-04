import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InvestPage } from './invest.page';

describe('InvestPage', () => {
  let component: InvestPage;
  let fixture: ComponentFixture<InvestPage>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(InvestPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
