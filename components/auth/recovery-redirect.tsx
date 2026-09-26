'use client';
import {useEffect} from 'react';

export function RecoveryRedirect(){
  useEffect(()=>{
    if(typeof window==='undefined')return;
    const hash=window.location.hash;
    if(!hash)return;
    const params=new URLSearchParams(hash.slice(1));
    if(params.get('type')==='recovery'&&window.location.pathname!=='/reset-password'){
      window.location.replace('/reset-password'+hash);
    }
  },[]);
  return null;
}
