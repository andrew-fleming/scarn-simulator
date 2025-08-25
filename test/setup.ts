/**
 * Global test setup file
 * Runs before all tests to configure the testing environment
 */
import { vi } from 'vitest';
import { sampleContractAddress } from '@midnight-ntwrk/zswap';

// Mock @midnight-ntwrk modules if needed for isolated testing
vi.mock('@midnight-ntwrk/zswap', () => ({
  sampleContractAddress: vi.fn(() => sampleContractAddress()),
}));

// Declare global type
declare global {
  function createMockCircuitContext(privateState?: any, contractState?: any): any;
}

// Global test utilities
global.createMockCircuitContext = (privateState = {}, contractState = null) => ({
  currentPrivateState: privateState,
  currentZswapLocalState: {},
  originalState: contractState || { data: [] },
  transactionContext: {
    state: [],
    address: sampleContractAddress()
  }
});
