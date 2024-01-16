import EventHandlerInterface from "../../../@shared/event/event-handler.interface";
import CustomerChangeAddress from "../customer-change-address.event";

export default class CustomerChangeAddressHandler
  implements EventHandlerInterface<CustomerChangeAddress>
{
  handle({ eventData }: CustomerChangeAddress): void {
    const { id, name, address } = eventData;

    console.log(
      `Endereço do cliente: ${id}, ${name} alterado para: ${address}`
    );
  }
}
