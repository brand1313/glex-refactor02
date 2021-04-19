import http from 'http';
import createErrors from 'http-errors';
import path from 'path';
import express, {Request, Response, NextFunction, Errback} from 'express';
import morgan from 'morgan';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import './cronjob';

import * as dotenv from 'dotenv';
import { BasicConfig } from './lib/interfaces';
import { Socket } from 'net';

dotenv.config({path: path.join(__dirname,'/environment/.env')});

class ApiServer extends http.Server {
    
    private static instance;
    
    private app:express.Application;
    private config:BasicConfig;
    private currentConns:any;
    private busy:any;
    private stopping:boolean;
    private routes:Array<any>


    constructor(config:BasicConfig, routes:Array<any>){

        const app = express();
        super(app);
        this.app = app;
        this.config = config;
        this.currentConns = new Set();
        this.busy = new WeakSet();
        this.stopping = false;
        this.routes = routes;

        if(!ApiServer.instance){
            ApiServer.instance = this;
        }

        return ApiServer.instance;
    }

    async start(){

        this.app.use(morgan('dev'));

        this.app.use((req:Request, res:Response, next:NextFunction) => {
            this.busy.add(req.socket);
            console.log('클라이언트 요청');

            res.on('finish', () => {
                if(this.stopping) req.socket.end();
                this.busy.delete(req.socket);
                
                console.log('클라이언트 요청처리 완료');
                console.log(`${this.busy.has(req.socket)}`);
            });

            next();
        });
        
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended:true}));
        this.app.use(express.raw());
        this.app.use(express.text());

        this.app.use(cookieParser(process.env.COOKIE_SECRET));

        this.app.use(session({
            resave: false,
            saveUninitialized: false,
            secret: process.env.COOKIE_SECRET,
            cookie: {
                httpOnly: true,
                secure: false,
                maxAge: 12000 * 60 * 60
            }
        }));

        this.app.get('/health', (req:Request, res:Response) => {
            res.send('<h1>서버 정상 작동 중</h1>');
        });

        this.applyRoutes(this.routes);

        this.on('connection',(socket:Socket) =>{
            this.currentConns.add(socket);
            console.log('클라이언트 연결');

            socket.on('close', () => {
                this.currentConns.delete(socket);
                console.log('연결해제 되었습니다.');     
            });
        });

        this.app.use((req:Request, res:Response, next:NextFunction) => {
            next(createErrors(404));
        });

        this.app.use(this.errHandler);

        return this;
    }

    applyRoutes(routes:Array<any>){
        for(const route of routes){
            this.app.use(route.url, route.controller);
        }
    }

    shutdown(){
        if(this.stopping){
            console.log('서버 이미 종료 중...');
            return;
        }

        this.stopping = true;

        this.close((err:Error) => {
            if(err){
                console.log('서버 종료 중 에러 발생');
                console.log(`에러 메세지 : ${err.message}`);
            }else{
                console.log('서버 shutdown - 정상 종료');
                process.exit(0);
            }
        });

        setTimeout(() => {
            console.log('서버 shutdown - 비정상 종료')
        },this.config.shutdownTimeout);

        if(this.currentConns.size > 0){
            console.log(`현재 동시접속 중인 연결 ${this.currentConns.size}을 종료 대기 중입니다.`);

            for(const con of this.currentConns){
                if(!this.busy.has(con)){
                    console.log('순차 종료!!');
                    con.end();
                }
            }
        }
    }
    
    errHandler(req:Request, res:Response, next:Errback){
        console.error('에러 발생');
        res.status(500).send('<h1>에러 발생</h1>');
    }
}

const init = async (config:BasicConfig, routes:Array<any>):Promise<ApiServer> => {
    
    const server:ApiServer = new ApiServer(config, routes);
    return await server.start();

}

export {
    ApiServer, init
}