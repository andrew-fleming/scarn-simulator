# 🕵️ ScarnSimulator

*"I'm gonna dig up Scarn's dead wife, and I'm gonna hump her real good."* - Your contract tests, probably

The Scarn Simulator provides a testing and development environment for Compact contracts on the Midnight network.
It allows users to simulate contract behavior locally without deploying to the blockchain.

## Usage

### 1. Create the base

The base simulator is really used as a config class that the real simulator will extend.
The base simulator needs:

- `Contract` and the `ledger` from the compiled artifact.
- The contract's witnesses and private state.
- Constructor parameters required to initialize the contract.

```typescript
import { createSimulator } from 'scarn-simulator';
import { Contract as MyContract, ledger } from './artifacts/MyContract/contract/index.cjs';
import { MyContractWitnesses, MyContractPrivateState } from './MyContractWitnesses.js';

// Create base simulator
const MyContractSimulatorBase = createSimulator({
  contractFactory: (witnesses) => new MyContract<MyContractPrivateState>(witnesses),
  defaultPrivateState: () => MyContractPrivateState,
  contractArgs: (arg1: Field, arg2: Field) => {
    return [arg1, arg2];
  },
  ledgerExtractor: (state) => ledger(state),
  witnessesFactory: () => MyContractWitnesses(),
});
```

### 2. Extend base simulator and wrap the exposed circuits

Extend the base simulator andddddd

```typescript
// Create the simulator class
export class SampleZOwnableSimulator extends SampleZOwnableSimulatorBase {
  constructor(
    ownerId: Uint8Array,
    instanceSalt: Uint8Array,
    options: BaseSimulatorOptions<
      SampleZOwnablePrivateState,
      ReturnType<typeof SampleZOwnableWitnesses>
    > = {}
  ) {
    super(ownerId, instanceSalt, options);
  }

// Call pure circuits (read-only)
const currentOwner = simulator.circuits.pure.owner();

// Call impure circuits (state-modifying)
simulator.circuits.impure.transferOwnership(newOwnerBytes);

// Check public state
const publicState = simulator.getPublicState();

3. Advanced Features
Caller Context Switching

// One-time caller override
const result = simulator.as(alicePK).circuits.impure.someMethod();

// Persistent caller override
simulator.setPersistentCaller(bobPK);
simulator.circuits.impure.method1(); // Called as Bob
simulator.circuits.impure.method2(); // Also called as Bob

// Reset caller overrides
simulator.resetAllCallers();

Witness Management

// Override specific witness functions
simulator.overrideWitness('secretNonce', () => new Uint8Array(32));

// Replace all witnesses
simulator.witnesses = new CustomWitnesses();

State Access

// Access private state
const privateState = simulator.getPrivateState();

// Access contract state
const contractState = simulator.getContractState();

// Access full circuit context
const context = simulator.circuitContext;

### Example

import { describe, it, expect } from 'vitest';

describe('MyContract', () => {
  let simulator: MyContractSimulator;

  beforeEach(() => {
    simulator = new MyContractSimulator(ownerBytes, salt);
  });

  it('should transfer ownership', () => {
    const newOwner = toBytes('new-owner');

    simulator.circuits.impure.transferOwnership(newOwner);

    const currentOwner = simulator.circuits.pure.owner();
    expect(currentOwner).toEqual(/* expected commitment */);
  });

  it('should reject unauthorized calls', () => {
    const unauthorized = toBytes('unauthorized');

    expect(() => {
      simulator.as(unauthorized).circuits.impure.transferOwnership(newOwner);
    }).toThrow();
  });
});