import {
  type CircuitContext,
  type ConstructorContext,
  type ContractState,
  constructorContext,
  QueryContext,
} from '@midnight-ntwrk/compact-runtime';

/**
 * A composable utility class for managing Compact contract state in simulations.
 *
 * Handles initialization and lifecycle management of the `CircuitContext`,
 * which includes private state, public (ledger) state, zswap local state, and transaction context.
 */
export class StateManager<P> {
  public context: CircuitContext<P>;

  /**
   * Creates an instance of `StateManager`.
   *
   * @param contract - A compiled Compact contract instance exposing `initialState()`
   * @param privateState - The initial private state to inject into the contract
   * @param coinPK - The caller's coin public key
   * @param contractAddress - Optional override for the contract's address
   * @param contractArgs - Additional arguments to pass to the contract constructor
   */
  constructor(
    contract: {
      initialState: (
        ctx: ConstructorContext<P>,
        ...args: any[]
      ) => {
        currentPrivateState: P;
        currentContractState: ContractState;
        currentZswapLocalState: any;
      };
    },
    privateState: P,
    coinPK: string,
    contractAddress?: string,
    ...contractArgs: any[]
  ) {
    const initCtx = constructorContext(privateState, coinPK);

    const {
      currentPrivateState,
      currentContractState,
      currentZswapLocalState,
    } = contract.initialState(initCtx, ...contractArgs);

    this.context = {
      currentPrivateState,
      currentZswapLocalState,
      originalState: currentContractState,
      transactionContext: new QueryContext(
        currentContractState.data,
        contractAddress ?? coinPK,
      ),
    };
  }

  /** Retrieves the current `CircuitContext` */
  getContext(): CircuitContext<P> {
    return this.context;
  }

  /** Replaces the internal `CircuitContext` with a new one */
  setContext(newContext: CircuitContext<P>) {
    this.context = newContext;
  }

  /** Updates just the private state inside the existing context */
  updatePrivateState(newPrivateState: P) {
    this.context.currentPrivateState = newPrivateState;
  }
}
