import Link from 'next/link';
export default function NotFound(){return <main id="conteudo" className="empty-state" style={{paddingTop:80}}><p className="eyebrow">Casa Aura</p><h1 style={{margin:'20px 0'}}>Essa peça ainda<br/>não mora aqui.</h1><p>Não encontramos a página que você procurava.</p><Link className="button" href="/loja">Voltar à coleção</Link></main>}
