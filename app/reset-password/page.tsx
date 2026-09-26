'use client';
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';

export default function ResetPasswordPage(){
  const [token,setToken]=useState('');
  const [password,setPassword]=useState('');
  const [confirm,setConfirm]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [done,setDone]=useState(false);
  const router=useRouter();

  useEffect(()=>{
    const params=new URLSearchParams(window.location.hash.slice(1));
    const accessToken=params.get('access_token')||'';
    const type=params.get('type');
    if(type==='recovery'&&accessToken)setToken(accessToken);
    else setError('Link de recuperação inválido ou expirado. Solicite um novo e-mail.');
  },[]);

  async function submit(e:React.FormEvent){
    e.preventDefault();
    setError('');
    if(password.length<8){setError('Use uma senha com pelo menos 8 caracteres.');return}
    if(password!==confirm){setError('As senhas não coincidem.');return}
    if(!token){setError('Link de recuperação inválido ou expirado.');return}
    setBusy(true);
    try{
      const r=await fetch('/api/auth/reset-password',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({access_token:token,password})
      });
      const d=await r.json();
      if(!r.ok)throw new Error(d.error||'Não foi possível alterar a senha.');
      setDone(true);
      window.history.replaceState(null,'','/reset-password');
      setTimeout(()=>router.push('/admin'),1200);
    }catch(e){
      setError(e instanceof Error?e.message:'Não foi possível alterar a senha.');
    }finally{setBusy(false)}
  }

  return <main id="conteudo" className="container">
    <div className="page-intro" style={{paddingTop:45}}>
      <p className="eyebrow">Segurança da conta</p>
      <h1>Crie uma nova senha.</h1>
    </div>
    <div className="login-box" style={{marginBottom:70}}>
      {done?<div>
        <h2>Senha alterada.</h2>
        <p className="small muted">Você será direcionado para a área da marca.</p>
      </div>:<form onSubmit={submit}>
        <label className="form-label"><span>Nova senha</span><input className="field" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)}/></label>
        <label className="form-label"><span>Confirmar nova senha</span><input className="field" type="password" autoComplete="new-password" minLength={8} required value={confirm} onChange={e=>setConfirm(e.target.value)}/></label>
        <button className="button" disabled={busy||!token}>{busy?'Alterando…':'Salvar nova senha'}</button>
        {error&&<p className="error-message" role="alert" style={{marginTop:20}}>{error}</p>}
      </form>}
    </div>
  </main>
}
