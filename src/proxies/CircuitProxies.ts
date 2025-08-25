import type { CircuitContext } from '@midnight-ntwrk/compact-runtime';
import type {
  ContextlessCircuits,
  ExtractImpureCircuits,
  ExtractPureCircuits,
} from '../types/index.js';

/**
 * Creates lazily-initialized circuit proxies for pure and impure contract functions.
 *
 * This utility function helps create consistent circuit proxies across different
 * simulator implementations while providing lazy initialization for performance.
 */
export function createCircuitProxies<
  P,
  ContractType extends { circuits: any; impureCircuits: any },
>(
  contract: ContractType,
  getContext: () => CircuitContext<P>,
  getCallerContext: () => CircuitContext<P>,
  updateContext: (ctx: CircuitContext<P>) => void,
  createPureProxy: <C extends object>(
    circuits: C,
    context: () => CircuitContext<P>,
  ) => ContextlessCircuits<C, P>,
  createImpureProxy: <C extends object>(
    circuits: C,
    context: () => CircuitContext<P>,
    updateContext: (ctx: CircuitContext<P>) => void,
  ) => ContextlessCircuits<C, P>,
) {
  let pureProxy: ContextlessCircuits<ExtractPureCircuits<ContractType>, P> | undefined;
  let impureProxy: ContextlessCircuits<ExtractImpureCircuits<ContractType>, P> | undefined;

  return {
    get circuits() {
      if (!pureProxy) {
        pureProxy = createPureProxy(contract.circuits, getContext);
      }
      if (!impureProxy) {
        impureProxy = createImpureProxy(
          contract.impureCircuits,
          getCallerContext,
          updateContext,
        );
      }
      return {
        pure: pureProxy,
        impure: impureProxy,
      };
    },
    resetProxies() {
      pureProxy = undefined;
      impureProxy = undefined;
    },
  };
}
