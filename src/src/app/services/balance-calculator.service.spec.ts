import { TestBed } from '@angular/core/testing';

import { BalanceCalculatorService } from './balance-calculator.service';

describe('BalanceCalculatorService', () => {
  let service: BalanceCalculatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BalanceCalculatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
