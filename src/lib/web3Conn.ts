import Web3 from 'web3';


class Web3Conn {
    
    public static infura = `https://ropsten.infura.io/v3/${process.env.INFURA_KEY_ROPSTEN}`;
    public static web3:Web3 = new Web3(new Web3.providers.HttpProvider(Web3Conn.infura));

}


export default Web3Conn;