import 'dotenv/config'
import talaria, { UnimplementedTalariaServiceService } from '@kade/grpc'
import talariaSever from './server'

const server = new talaria.Server()
server.addService(UnimplementedTalariaServiceService.definition, talariaSever)

const PORT = process.env.GRPC_PORT! || process.env.PORT! || '8089'

function main() {
    server.bindAsync(`0.0.0.0:${PORT}`, talaria.ServerCredentials.createInsecure(), (error, port) => {
        if (error) {
            console.log("Error::", error)
            return
        }
        server.start()
        console.log("Server started on port::", port)
    })
}

main()
