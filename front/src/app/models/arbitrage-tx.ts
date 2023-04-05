export interface ArbitrageTx {
  hash: string;
  pool0: number;
  pool1: number;
  used: string;
  profits: string;
  date: Date;
}

export interface Arbitrage {
  address: string; //arbitrage contract address
  totalStaked: string;
  totalProfits: string; // historical total profits
}
