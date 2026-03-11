import { feesService } from './feesService';

describe('feesService', () => {
  it('should fetch all fees', async () => {
    const result = await feesService.getAllFees();
    console.log('Fetched fees:', result);
    expect(Array.isArray(result)).toBe(true);
  });
});
