import express, {Request, Response, NextFunction} from 'express';
import Web3Conn from '../lib/web3Conn';

const web3 = Web3Conn.web3;

class Controllers {

    private static instance:Controllers;
    
    private url;
    private controller:express.IRouter;

    constructor(){
        this.url='/';
        this.controller = express.Router();

        this.controller.get('/routertest',this.routerTest);
        this.controller.get('/web3test',this.web3Test);

        if(!Controllers.instance){
            Controllers.instance = this;
        }

        return Controllers.instance;
    }

    routerTest(req:Request, res:Response){
        res.send('<h1>라우팅 테스트 정상</h1>');
    }

    web3Test(req:Request, res:Response){
        console.log(web3);
        res.send('<h1>web3 연결 테스트 성공<h1>');
    }

    getInstance():Controllers{
        return this;
    }
}

const routerInit = async ():Promise<Controllers> => {

    const router = new Controllers();
    return await router.getInstance(); 
}

export {
    routerInit
}