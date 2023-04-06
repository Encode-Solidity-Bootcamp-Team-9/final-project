export interface UserInfo {
  staked: string; //lifetime stake
  totalProfits: string; //lifetime profits
  locktime: Date;
  feth: string; // balance in wallet
  nas: string; // balance in wallet
  withdrawn: string; //lifetime withdrawn
  claimed: string; //lifetime claimed
  activeStaked: string; //current stake
  activeProfits: string; //current profits
}