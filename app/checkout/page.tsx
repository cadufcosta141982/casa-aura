import {Checkout} from '@/components/store/checkout';
import {shopReady} from '@/lib/catalog';
export const dynamic='force-dynamic';
export const metadata={title:'Finalizar compra',robots:{index:false,follow:false}};
export default function CheckoutPage(){return <Checkout enabled={shopReady()}/>}
