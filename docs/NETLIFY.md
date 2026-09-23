# Publicar Casa Aura na Netlify

Importe `cadufcosta141982/casa-aura` pelo GitHub e selecione o plano Free.
O netlify.toml define o build Next.js e a pasta de saída personalizada.
O adaptador Next.js da Netlify é aplicado automaticamente.

Cadastre as variáveis de .env.example nas configurações do projeto, disponíveis
para build e Functions. Mantenha LIVE_CHECKOUT_ENABLED=false até concluir os
passos de banco, catálogo, frete, pagamentos e e-mails em ATIVACAO.md.
Use o domínio HTTPS publicado em NEXT_PUBLIC_SITE_URL e no webhook Mercado Pago.
Faça novo deploy após alterar as variáveis.

## E-mails

email-schedule roda diariamente às 12h UTC e aciona email-worker, uma função
em segundo plano. Ela valida CRON_SECRET e processa a fila existente no Supabase.
As duas funções só operam com LIVE_CHECKOUT_ENABLED=true. Não é necessário
ativar o cron da Vercel. Não mantenha dois agendadores de produção ativos.
A função em segundo plano permite processar lotes sem o limite de 30 segundos
da função agendada. Verifique as execuções em Functions e os erros em email_outbox.
As integrações ainda dependem de credenciais reais e homologação.

## Limites

O Free permite uso comercial e inclui 300 créditos mensais na oferta consultada
em 23/09/2026. O projeto pode ser pausado ao atingir o limite. Acompanhe o consumo
no painel. Domínio próprio e serviços externos têm condições separadas.

https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/
https://docs.netlify.com/build/functions/scheduled-functions/
https://docs.netlify.com/build/functions/background-functions/
