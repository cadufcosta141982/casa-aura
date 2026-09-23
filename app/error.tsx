'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <main id="conteudo" className="empty-state" style={{paddingTop:70}}><h1>Uma pequena pausa.</h1><p style={{marginTop:25}}>Não foi possível carregar esta página. Tente novamente em instantes.</p><button className="button" onClick={reset}>Tentar novamente</button></main>}
