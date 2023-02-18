import { FastifyReply } from 'fastify';
import { v4 as uuidV4 } from 'uuid'


export class clientManager {

    private clients: {
        [randomClientId: string]: {
            response: FastifyReply,
            topics: string[]
        }
    } = {}

    constructor() {

    }



    addNewClient(opts: {
        response: FastifyReply,
        topics: string[]
    }) {
        const id = uuidV4();


        this.clients[id] = {
            ...opts,
        }

        return id;
    }


    deleteClient(id: string) {
        delete this.clients[id];
    }




    sendEvents(channel: string, event: { [key: string]: any }, topics: string[]) {
        const clientsWhereEvenetWillBeSent = Object.keys(this.clients).filter(id => topics.find(t => this.clients[id].topics.includes(t)))

        for (const clientId of clientsWhereEvenetWillBeSent) {
            if (!this.clients[clientId].response.raw.closed) {
                const data = `data: ${JSON.stringify({ event })}\n\n`;
                this.clients[clientId].response.raw.write(data);
            }
        }
    }


    connectedClientsNumber(){
        //console.log(Object.keys(this.clients))
        return Object.keys(this.clients).length
    };


    getAllActiveTopics(){
        return [...new Set(Object.keys(this.clients).map(k=>this.clients[k].topics).flat())]
    }

}

