import {Checkout} from '@/components/store/checkout';
import {shopReady} from '@/lib/catalog';
import {getSiteSettings} from '@/lib/settings';
export const dynamic='force-dynamic';
export const metadata={title:'Finalizar compra',robots:{index:false,follow:false}};
export default async function CheckoutPage(){const settings=await getSiteSettings();return <Checkout enabled={shopReady()} pixDiscountPercent={Number(settings.pix_discount_percent)} maxInstallments={Number(settings.max_installments)}/>}
