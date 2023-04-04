export interface ArbitrageTx {
  hash: string;
  pool0: string;
  pool1: string;
  used: number;
  fees: number;
  date: Date;
}

export interface Arbitrage {
  totalStaked: string;
  totalProfits: string; // historical total profits
  apr: number;
}

export interface PoolsState {
  uniFETH: string;
  uniNAS: string;
  sushiFETH: string;
  sushiNAS: string;
}
