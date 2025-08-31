import { StateValue } from '@midnight-ntwrk/compact-runtime';
/**
 * Configuration interface for the simulator factory.
 * @template P - Private state type
 * @template L - Ledger state type
 * @template W - Witnesses type
 * @template TArgs - Tuple type of contract-specific arguments passed to StateManager
 */
export interface SimulatorConfig<P, L, W, TArgs extends readonly any[] = readonly any[]> {
  /** Factory function to create the contract instance */
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  contractFactory: (witnesses: W) => any;
  /** Function to generate default private state */
  defaultPrivateState: () => P;
  /**
   * Function to process contract-specific arguments for StateManager initialization.
   * Receives the arguments as spread parameters and returns them as an array
   * to be passed to StateManager after the standard parameters (contract, privateState, coinPK, contractAddress).
   *
   * @example
   * // For a contract with owner and salt arguments:
   * contractArgs: (owner, instanceSalt) => [owner, instanceSalt]
   *
   * // For a contract with no additional arguments:
   * contractArgs: () => []
   */
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  contractArgs: (...args: TArgs) => any[];
  /** Function to extract ledger state from contract state */
  ledgerExtractor: (state: StateValue) => L;
  /** Factory function to create default witnesses */
  witnessesFactory: () => W;
}
