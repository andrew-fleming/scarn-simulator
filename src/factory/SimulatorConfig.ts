/**
 * Configuration interface for the simulator factory.
 */
export interface SimulatorConfig<P, L, W> {
  /** Factory function to create the contract instance */
  contractFactory: (witnesses: W) => any;
  /** Function to generate default private state */
  defaultPrivateState: () => P;
  /** Function to transform constructor arguments for the contract */
  contractArgs: (...args: any[]) => any[];
  /** Function to extract ledger state from contract state */
  ledgerExtractor: (state: any) => L;
  /** Factory function to create default witnesses */
  witnessesFactory: () => W;
}
