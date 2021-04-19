import { createConnection, Connection } from 'typeorm';

class DB_CONNECT {
    public async connection () {
        try {
            const db:Connection = await createConnection();
            console.log('DB 연결 성공');
        } catch (error) {
            console.log(error.message);
            throw new Error(error.message);
        }
    }
}

const dbConn = new DB_CONNECT();

export default dbConn;
