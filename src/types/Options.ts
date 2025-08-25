/**
 * Base configuration options for simulator constructors.
 *
 * @template P - Private state type
 * @template W - Witnesses type
 */
export type BaseSimulatorOptions<P, W> = {
  /** Initial private state (uses default if not provided) */
  privateState?: P;
  /** Witness functions (uses default if not provided) */
  witnesses?: W;
  /** Coin public key for transactions */
  coinPK?: string;
  /** Contract deployment address */
  contractAddress?: string;
};
