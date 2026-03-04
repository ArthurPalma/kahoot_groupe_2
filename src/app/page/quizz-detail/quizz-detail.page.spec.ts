import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizzDetailPage } from './quizz-detail.page';

describe('QuizzDetailPage', () => {
  let component: QuizzDetailPage;
  let fixture: ComponentFixture<QuizzDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(QuizzDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
