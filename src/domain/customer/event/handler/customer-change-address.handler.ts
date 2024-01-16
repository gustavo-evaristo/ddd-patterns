import EventHandlerInterface from "../../../@shared/event/event-handler.interface";
import CustomerChangeAddressEvent from "../customer-change-address.event";

export default class CustomerChangeAddressHandler
  implements EventHandlerInterface<CustomerChangeAddressEvent>
{
  handle({ eventData }: CustomerChangeAddressEvent): void {
    const { id, name, Address } = eventData;

    console.log(
      `Endereço do cliente: ${id}, ${name} alterado para: ${Address}`
    );
  }
}
