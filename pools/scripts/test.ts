import Web3 from 'web3';

const aa = "0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000017707269636520736c697070616765206465746563746564000000000000000000";
const a = "000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000035354460000000000000000000000000000000000000000000000000000000000";



const w =  new Web3()







const c = w.eth.abi.encodeFunctionSignature(aa);

console.log(c);


const b = w.eth.abi.decodeParameter('string', a);

console.log(b);


//Web3.web3.eth.abi.decodeParameter('string', a)

