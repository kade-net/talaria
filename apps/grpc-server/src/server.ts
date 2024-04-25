import talaria, { UnimplementedTalariaServiceService } from '@kade/grpc';
import getTalariaEvent from './service-implementers/get-talaria-event';
import getTalariaEvents from './service-implementers/get-talaria-events';

class TalariaSever implements UnimplementedTalariaServiceService {
    [method: string]: talaria.UntypedHandleCall;
    GetTalariaEvents = getTalariaEvents
    GetTalariaEvent = getTalariaEvent
}

const talariaSever = new TalariaSever()

export default talariaSever
