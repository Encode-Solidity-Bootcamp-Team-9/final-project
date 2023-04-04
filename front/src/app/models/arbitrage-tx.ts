export interface ArbitrageTx {
  hash: string;
  pool0: string;
  pool1: string;
  used: number;
  profits: number;
  date: Date;
}

export interface Arbitrage {
  totalStaked: string;
  totalProfits: string; // historical total profits
  apr: number; // TODO
}

export interface PoolsState {
  uniPoolAddress: string;
  sushiPoolAddress: string;
  uniFETH: string;
  uniNAS: string;
  sushiFETH: string;
  sushiNAS: string;
}
