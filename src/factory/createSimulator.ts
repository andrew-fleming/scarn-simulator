import { sampleContractAddress } from '@midnight-ntwrk/zswap';
import type { BaseSimulatorOptions } from '../types/Options.js';
import { ContractSimulator } from '../core/ContractSimulator.js';
import { StateManager } from '../core/StateManager.js';
import type { SimulatorConfig } from './SimulatorConfig.js';

/**
 * Factory function to create simulator classes with consistent boilerplate elimination.
 *
 * This factory creates a class that extends ContractSimulator with all the common
 * functionality needed for contract simulation, including:
 * - Witness management
 * - State management
 * - Circuit proxy creation
 * - Options handling
 *
 * @param config - Configuration object defining how to create and manage the simulator
 * @returns A class constructor that can be extended to create specific simulators
 */
export function createSimulator<P, L, W>(config: SimulatorConfig<P, L, W>) {
  return class GeneratedSimulator extends ContractSimulator<P, L> {
    contract: any;
    readonly contractAddress: string;
    public _witnesses: W;

    constructor(...args: any[]) {
      // Extract options (always last parameter if it looks like options)
      const lastArg = args[args.length - 1];
      const hasOptions = lastArg &&
        typeof lastArg === 'object' &&
        !Array.isArray(lastArg) &&
        !(lastArg instanceof Uint8Array) &&
        ('privateState' in lastArg || 'witnesses' in lastArg || 'coinPK' in lastArg || 'contractAddress' in lastArg);

      const options = hasOptions
        ? args.pop() as BaseSimulatorOptions<P, W>
        : {} as BaseSimulatorOptions<P, W>;

      const {
        privateState = config.defaultPrivateState(),
        witnesses = config.witnessesFactory(),
        coinPK = '0'.repeat(64),
        contractAddress = sampleContractAddress(),
      } = options;

      super();

      this._witnesses = witnesses;
      this.contract = config.contractFactory(this._witnesses);

      const contractArgs = config.contractArgs(...args);

      this.stateManager = new StateManager(
        this.contract,
        privateState,
        coinPK,
        contractAddress,
        ...contractArgs,
      );

      this.contractAddress = this.circuitContext.transactionContext.address;
    }

    public _pureCircuitProxy?: any;
    public _impureCircuitProxy?: any;

    public get pureCircuit() {
      if (!this._pureCircuitProxy) {
        this._pureCircuitProxy = this.createPureCircuitProxy(
          this.contract.circuits,
          () => this.circuitContext,
        );
      }
      return this._pureCircuitProxy;
    }

    public get impureCircuit() {
      if (!this._impureCircuitProxy) {
        this._impureCircuitProxy = this.createImpureCircuitProxy(
          this.contract.impureCircuits,
          () => this.getCallerContext(),
          (ctx) => {
            this.circuitContext = ctx;
          },
        );
      }
      return this._impureCircuitProxy;
    }

    public get circuits() {
      return {
        pure: this.pureCircuit,
        impure: this.impureCircuit,
      };
    }

    public resetCircuitProxies(): void {
      this._pureCircuitProxy = undefined;
      this._impureCircuitProxy = undefined;
    }

    getPublicState(): L {
      return config.ledgerExtractor(
        this.circuitContext.transactionContext.state,
      );
    }

    // Common witness management methods
    public get witnesses(): W {
      return this._witnesses;
    }

    public set witnesses(newWitnesses: W) {
      this._witnesses = newWitnesses;
      this.contract = config.contractFactory(this._witnesses);
      this.resetCircuitProxies();
    }

    public overrideWitness<K extends keyof W>(key: K, fn: W[K]) {
      this.witnesses = {
        ...this._witnesses,
        [key]: fn,
      } as W;
    }
  };
}
