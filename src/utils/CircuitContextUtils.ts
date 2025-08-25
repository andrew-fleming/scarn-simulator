import {
  type CircuitContext,
  type CoinPublicKey,
  type ContractAddress,
  type ContractState,
  emptyZswapLocalState,
  QueryContext,
} from '@midnight-ntwrk/compact-runtime';
import type { IContractSimulator } from '../types/index.js';

/**
 * Constructs a `CircuitContext` from the given state and sender information.
 *
 * This is typically used at runtime to provide the necessary context
 * for executing circuits, including contract state, private state,
 * sender identity, and transaction data.
 */
export function useCircuitContext<P>(
  privateState: P,
  contractState: ContractState,
  sender: CoinPublicKey,
  contractAddress: ContractAddress,
): CircuitContext<P> {
  return {
    originalState: contractState,
    currentPrivateState: privateState,
    transactionContext: new QueryContext(contractState.data, contractAddress),
    currentZswapLocalState: emptyZswapLocalState(sender),
  };
}

/**
 * Prepares a new `CircuitContext` using the given sender and contract.
 *
 * Useful for mocking or updating the circuit context with a custom sender.
 */
export function useCircuitContextSender<
  P,
  L,
  C extends IContractSimulator<P, L>,
>(contract: C, sender: CoinPublicKey): CircuitContext<P> {
  const currentPrivateState = contract.getPrivateState();
  const originalState = contract.getContractState();
  const contractAddress = contract.contractAddress;

  return {
    originalState,
    currentPrivateState,
    transactionContext: new QueryContext(originalState.data, contractAddress),
    currentZswapLocalState: emptyZswapLocalState(sender),
  };
}
