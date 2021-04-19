import { BasicConfig } from './lib/interfaces';
import config from './lib/config';
import { ApiServer, init } from './server';
import { routerInit } from './routes/controllers';
import dbConn from './lib/dbConn';

const main = async () => {

    await dbConn.connection();    

    const mainRoute = await routerInit();
    const routes:Array<any> = [mainRoute];
    
    const basicConfig:BasicConfig = await config.basicConfig();
    const server:ApiServer = await init(basicConfig, routes);

    server.listen(basicConfig.port,()=>{
        console.log(`server running at ${basicConfig.port}`);
    });

    process.on("SIGTERM", () => server.shutdown());
    process.on("SIGINT", () => server.shutdown());
}

main();