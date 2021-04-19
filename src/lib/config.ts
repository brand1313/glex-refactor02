import { BasicConfig } from "./interfaces"

export default {
    basicConfig : ():BasicConfig => {
        
        return {
            port : process.env.PORT || 8080,
            shutdownTimeout : 10000
        }

    }
}