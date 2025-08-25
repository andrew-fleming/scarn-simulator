import type {
  CircuitContext,
  CoinPublicKey,
  ContractState,
} from '@midnight-ntwrk/compact-runtime';
import type { ContextlessCircuits, IContractSimulator } from '../types/index.js';

/**
 * Abstract base class for simulating contract behavior.
 *
 * Provides common functionality for managing circuit contexts and creating proxies
 * for pure and impure circuit functions.
 */
export abstract class AbstractSimulator<P, L> implements IContractSimulator<P, L> {
  /**
   * Single-use caller override (cleared after each circuit call).
   * Set via `as(caller)` for one-time caller context switching.
   */
  public callerOverride: CoinPublicKey | null = null;

  /**
   * Persistent caller override (until explicitly cleared).
   * Set via `setPersistentCaller(caller)` for ongoing caller context.
   */
  public persistentCallerOverride: CoinPublicKey | null = null;

  /** The deployed contract's address */
  abstract readonly contractAddress: string;

  /** The current circuit context */
  abstract circuitContext: CircuitContext<P>;

  /** Retrieves the current public ledger state */
  abstract getPublicState(): L;

  /**
   * Sets the caller context for the next circuit call only (auto-resets).
   */
  public as(caller: CoinPublicKey): this {
    this.callerOverride = caller;
    return this;
  }

  /**
   * Sets a persistent caller that will be used for all subsequent circuit calls.
   */
  public setPersistentCaller(caller: CoinPublicKey | null): void {
    this.persistentCallerOverride = caller;
  }

  /**
   * Clears both single-use and persistent caller overrides.
   */
  public resetAllCallers(): this {
    this.callerOverride = null;
    this.persistentCallerOverride = null;
    return this;
  }

  /**
   * Retrieves the current private state from the circuit context.
   */
  public getPrivateState(): P {
    return this.circuitContext.currentPrivateState;
  }

  /**
   * Retrieves the original contract state from the circuit context.
   */
  public getContractState(): ContractState {
    return this.circuitContext.originalState;
  }

  /**
   * Creates a proxy wrapper around pure circuits.
   * Pure circuits do not modify contract state, so only the result is returned.
   */
  public createPureCircuitProxy<Circuits extends object>(
    circuits: Circuits,
    context: () => CircuitContext<P>,
  ): ContextlessCircuits<Circuits, P> {
    const self = this;

    return new Proxy(circuits, {
      get(target, prop, receiver) {
        const original = Reflect.get(target, prop, receiver);
        if (typeof original !== 'function') return original;

        return (...args: any[]) => {
          const ctx = context();
          const fn = original as (ctx: CircuitContext<P>, ...args: any[]) => { result: any };
          const result = fn(ctx, ...args).result;

          // Auto-reset single-use caller override
          self.callerOverride = null;
          return result;
        };
      },
    }) as ContextlessCircuits<Circuits, P>;
  }

  /**
   * Creates a proxy wrapper around impure circuits.
   * Impure circuits can modify contract state, so the circuit context is updated accordingly.
   */
  public createImpureCircuitProxy<Circuits extends object>(
    circuits: Circuits,
    context: () => CircuitContext<P>,
    updateContext: (ctx: CircuitContext<P>) => void,
  ): ContextlessCircuits<Circuits, P> {
    const self = this;

    return new Proxy(circuits, {
      get(target, prop, receiver) {
        const original = Reflect.get(target, prop, receiver);
        if (typeof original !== 'function') return original;

        return (...args: any[]) => {
          const ctx = context();
          const fn = original as (
            ctx: CircuitContext<P>,
            ...args: any[]
          ) => { result: any; context: CircuitContext<P> };

          const { result, context: newCtx } = fn(ctx, ...args);
          updateContext(newCtx);

          // Auto-reset single-use caller override
          self.callerOverride = null;
          return result;
        };
      },
    }) as ContextlessCircuits<Circuits, P>;
  }

  /**
   * Optional method to reset any cached circuit proxies.
   */
  public resetCircuitProxies?(): void {}
}
